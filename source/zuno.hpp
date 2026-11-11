#pragma once

#include <librats/node/node.h>
#include <librats/subsystems/dht_discovery.h>
#include <librats/subsystems/message_json.h>

#include <chrono>
#include <mutex>
#include <string>
#include <vector>

namespace zuno {

class node_config {
public:
  std::string data_dir;
  uint16_t listen_port = 0;
  std::string name;
  std::string handler;
};

struct person {
  std::string id;
  std::string name;
  std::string handler;
  bool online = false;
  int64_t last_seen = 0; // Unix timestamp
};

class zuno {
public:
  explicit zuno(node_config config);
  ~zuno();

  zuno(const zuno &) = delete;
  auto operator=(const zuno &) -> zuno & = delete;
  zuno(zuno &&) = delete;
  auto operator=(zuno &&) -> zuno & = delete;

  auto get_peers() const -> std::vector<person>;
  auto peer_id() const -> std::string;

private:
  static auto make_config(const node_config &c) -> librats::NodeConfig;
  static auto now_ms() -> int64_t;

  node_config m_config;
  librats::Node m_node;
  mutable std::mutex m_mutex;
  std::vector<person> m_peers;
};

} // namespace zuno
