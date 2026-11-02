#include "zuno/lib.hpp"

auto main() -> int {
  auto const lib = library{};

  return lib.name == "zuno" ? 0 : 1;
}
