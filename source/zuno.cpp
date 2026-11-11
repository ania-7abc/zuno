#include "zuno.hpp"

#include <chrono>
#include <cstdint>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <utility>
#include <vector>

#include <librats/core/types.h>
#include <librats/node/config.h>
#include <librats/peer/peer.h>
#include <librats/peer/peer_id.h>
#include <librats/subsystems/dht_discovery.h>
#include <librats/subsystems/mdns_discovery.h>
#include <librats/subsystems/message_json.h>
#include <librats/subsystems/reconnection.h>
#include <librats/util/json.h>

namespace zuno {

zuno::zuno(node_config config)
    : m_config(std::move(config)), m_node(make_config(m_config)) {
  librats::DhtDiscovery::Config dht_cfg;
  dht_cfg.discovery_key = "zuno/1";

  librats::ReconnectionService::Config recon_cfg;
  recon_cfg.store_path = m_config.data_dir;

  m_node.add_subsystem(
      std::make_unique<librats::DhtDiscovery>(std::move(dht_cfg)));
  m_node.add_subsystem(
      std::make_unique<librats::ReconnectionService>(std::move(recon_cfg)));
  m_node.add_subsystem(std::make_unique<librats::MdnsDiscovery>());
  m_node.add_subsystem(std::make_unique<librats::MessageJson>());

  m_node.json()->on(
      "profile_request",
      [this](const librats::PeerId &from, const librats::Json &) -> void {
        librats::Json reply;
        reply["name"] = m_config.name;       // NOLINT
        reply["handler"] = m_config.handler; // NOLINT
        m_node.json()->send(from, "profile_response", reply);
      });

  m_node.json()->on(
      "profile_response",
      [this](const librats::PeerId &from, const librats::Json &j) -> void {
        bool changed = false;
        {
          const std::scoped_lock lock(m_mutex);
          const auto hex = from.short_hex();
          for (auto &p : m_peers) {
            if (p.id == hex) {
              p.name = j.value("name", "");
              p.handle = j.value("handler", "");
              changed = true;
              break;
            }
          }
        }
        if (changed) {
          notify_peers_changed();
        }
      });

  m_node.on_peer_connected([this](const librats::Peer &peer) -> void {
    {
      const std::scoped_lock lock(m_mutex);
      person p;
      p.id = peer.id().short_hex();
      p.online = true;
      m_peers.push_back(std::move(p));
    }
    m_node.json()->send(peer.id(), "profile_request", librats::Json::object());
    notify_peers_changed();
  });

  m_node.on_peer_disconnected(
      [this](const librats::PeerId &id, librats::CloseReason) -> void {
        {
          const std::scoped_lock lock(m_mutex);
          const auto hex = id.short_hex();
          for (auto &p : m_peers) {
            if (p.id == hex) {
              p.online = false;
              p.last_seen = now_ms();
              break;
            }
          }
        }
        notify_peers_changed();
      });

  if (!m_node.start()) {
    throw std::runtime_error("Failed to start librats Node");
  }
}

zuno::~zuno() { m_node.stop(); }

auto zuno::get_peers() const -> std::vector<person> {
  const std::scoped_lock lock(m_mutex);
  return m_peers;
}
auto zuno::get_profile() const -> person {
  return {
      .id = m_node.local_id().short_hex(),
      .name = m_config.name,
      .handle = m_config.handler,
      .online = true,
  };
}

void zuno::notify_peers_changed() const {
  if (m_config.on_peers_changed) {
    m_config.on_peers_changed();
  }
}

auto zuno::make_config(const node_config &c) -> librats::NodeConfig {
  librats::NodeConfig cfg;
  cfg.protocol = "zuno/1";
  cfg.listen_port = c.listen_port;
  cfg.bind_address = "::"; // IPv6 + IPv4
  cfg.data_dir = c.data_dir;
  return cfg;
}

auto zuno::now_ms() -> int64_t {
  using namespace std::chrono;
  return duration_cast<milliseconds>(system_clock::now().time_since_epoch())
      .count();
}

} // namespace zuno
