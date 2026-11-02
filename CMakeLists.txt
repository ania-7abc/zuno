cmake_minimum_required(VERSION 3.14)

include(cmake/prelude.cmake)

project(
    zuno
    VERSION 0.0.0
    DESCRIPTION "A serverless chat app where messages travel directly between peers"
    HOMEPAGE_URL "https://github.com/ania-7abc/zuno"
    LANGUAGES CXX
)

include(cmake/project-is-top-level.cmake)
include(cmake/variables.cmake)

# ---- Declare library ----

add_library(
    zuno_lib OBJECT
    source/lib.cpp
)

target_include_directories(
    zuno_lib ${warning_guard}
    PUBLIC
    "\$<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/includes>"
)

target_compile_features(zuno_lib PUBLIC cxx_std_20)

# ---- Declare executable ----

add_executable(zuno_exe source/main.cpp)
add_executable(zuno::exe ALIAS zuno_exe)

set_property(TARGET zuno_exe PROPERTY OUTPUT_NAME zuno)

target_compile_features(zuno_exe PRIVATE cxx_std_20)

target_link_libraries(zuno_exe PRIVATE zuno_lib)

# ---- Install rules ----

if(NOT CMAKE_SKIP_INSTALL_RULES)
  include(cmake/install-rules.cmake)
endif()

# ---- Developer mode ----

if(NOT zuno_DEVELOPER_MODE)
  return()
elseif(NOT PROJECT_IS_TOP_LEVEL)
  message(
      AUTHOR_WARNING
      "Developer mode is intended for developers of zuno"
  )
endif()

include(cmake/dev-mode.cmake)
