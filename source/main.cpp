#include <cstddef>
#include <string>

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
  webui::set_logger(&webui_logger);

  const auto window = webui::window();

#ifdef zuno_USE_VFS
  window.set_file_handler(vfs);
  const bool shown = window.show();
#else
  const bool shown = window.show("frontend/");
#endif

  if (!shown) {
    librats::Logger::getInstance().log(librats::LogLevel::ERROR, "webui",
                                       "Failed to show window");
    return 1;
  }

  webui::wait();
  webui::clean();
  return 0;
}
