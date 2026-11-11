#include "zuno.hpp"

#include <cstddef>
#include <filesystem>
#include <iostream>
#include <string>
#include <string_view>
#include <system_error>

#include <librats/util/json.h>
#include <librats/util/logger.h>

#include <webui.hpp>

#ifdef zuno_USE_VFS
#include "vfs.h"
#endif

namespace {

void webui_logger(const std::size_t level, const char *log_raw,
                  void * /*user_data*/) {
  std::string log = log_raw;
  log = log.substr(0, log.rfind('\n'));

  auto &logger = librats::Logger::getInstance();
  if (level == 2) {
    logger.log(librats::LogLevel::ERROR, "webui", log);
  } else {
    logger.log(librats::LogLevel::DEBUG, "webui", log);
  }
}

} // namespace

auto main() -> int {
  constexpr auto data_dir = "data";

  webui::set_logger(&webui_logger);

  auto window = webui::window();

  window.set_minimum_size(500, 300);
  window.set_size(800, 600);

  const auto zuno = zuno::zuno(zuno::node_config{
      .data_dir = data_dir,
      .listen_port = 0,
      .name = "Alex",
      .handler = "@alex",
  });

  std::error_code error;
  const auto profile_dir = std::filesystem::path(data_dir) / "webui-profile";
  std::filesystem::create_directories(profile_dir, error);
  if (error) {
    std::cerr << "Failed to create browser profile directory: "
              << error.message() << '\n';
    return 1;
  }

  window.set_profile("zuno", profile_dir.string());

  window.bind("fetchPeople", [&zuno](webui::window::event *event) -> void {
    const auto peers = zuno.get_peers();

    librats::Json json = librats::Json::array();
    for (const auto &peer : peers) {
      librats::Json obj;
      obj["id"] = peer.id;           // NOLINT
      obj["name"] = peer.name;       // NOLINT
      obj["handler"] = peer.handler; // NOLINT
      obj["online"] = peer.online;   // NOLINT
      if (!peer.online) {
        obj["last_seen"] = peer.last_seen; // NOLINT
      }
      json.push_back(obj);
    }

    event->return_string(json.dump());
  });

#ifdef zuno_USE_VFS
  window.set_file_handler(vfs);
  constexpr std::string_view content{};
#else
  constexpr std::string_view content{"frontend/"};
#endif

  bool shown = window.show_wv(content);
  if (!shown) {
    shown = window.show_browser(content);
  }

  if (!shown) {
    librats::Logger::getInstance().log(librats::LogLevel::ERROR, "webui",
                                       "Failed to show window");
    return 1;
  }

  webui::wait();
  webui::clean();
  return 0;
}
