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

# ---- Declare executable ----

add_executable(zuno_exe source/main.cpp)
add_executable(zuno::exe ALIAS zuno_exe)

set_property(TARGET zuno_exe PROPERTY OUTPUT_NAME zuno)

target_compile_features(zuno_exe PRIVATE cxx_std_20)

include(FetchContent)

set(WEBUI_BUILD_EXAMPLES OFF CACHE BOOL "Disable WebUI examples" FORCE)

set(RATS_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(RATS_BUILD_CLIENT OFF CACHE BOOL "" FORCE)
set(RATS_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
find_package(rats REQUIRED)

target_link_libraries(zuno_exe PUBLIC rats)

FetchContent_Declare(
        webui SYSTEM
        GIT_REPOSITORY https://github.com/webui-dev/webui
        GIT_TAG main
)
FetchContent_MakeAvailable(webui)

target_link_libraries(zuno_exe PRIVATE webui)

include(cmake/generate_vfs.cmake)
if (zuno_DEVELOPER_MODE)
  add_dependencies(zuno_exe frontend)
else ()
  add_dependencies(zuno_exe frontend-vfs)
  target_compile_definitions(zuno_exe PRIVATE zuno_USE_VFS)
  target_include_directories(zuno_exe SYSTEM PRIVATE ${OUTPUT_WEB_DIR})
endif ()

# ---- Install rules ----

if (NOT CMAKE_SKIP_INSTALL_RULES)
  include(cmake/install-rules.cmake)
endif ()

# ---- Developer mode ----

if (NOT zuno_DEVELOPER_MODE)
  return()
elseif (NOT PROJECT_IS_TOP_LEVEL)
  message(
          AUTHOR_WARNING
          "Developer mode is intended for developers of zuno"
  )
endif ()

include(cmake/dev-mode.cmake)
