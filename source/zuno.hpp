#pragma once

#include <librats/node/node.h>
#include <librats/util/json.h>

#include <chrono>
#include <functional>
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
  std::function<void()> on_peers_changed;
};

struct person {
  // NOLINTBEGIN
  std::string id;
  std::string name;
  std::string handle;
  bool online = false;
  int64_t last_seen = 0; // Unix timestamp
  // NOLINTEND

  [[nodiscard]] auto to_json() const -> librats::Json {
    librats::Json obj;
    obj["id"] = id;         // NOLINT
    obj["name"] = name;     // NOLINT
    obj["handle"] = handle; // NOLINT
    obj["online"] = online; // NOLINT
    if (!online) {
      obj["last_seen"] = last_seen; // NOLINT
    }
    return obj;
  }
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
  auto get_profile() const -> person;

private:
  static auto make_config(const node_config &c) -> librats::NodeConfig;
  static auto now_ms() -> int64_t;
  void notify_peers_changed() const;

  node_config m_config;
  librats::Node m_node;
  mutable std::mutex m_mutex;
  std::vector<person> m_peers;
};

} // namespace zuno
