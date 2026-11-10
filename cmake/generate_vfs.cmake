find_package(Python3 COMPONENTS Interpreter REQUIRED)
find_program(NPM npm REQUIRED)

# ---- Paths ----
set(FRONTEND_SRC "${CMAKE_CURRENT_SOURCE_DIR}/frontend")
set(FRONTEND_BIN "${CMAKE_CURRENT_BINARY_DIR}/frontend")
set(OUTPUT_WEB_DIR "${CMAKE_CURRENT_BINARY_DIR}/vfs")
set(VFS_SCRIPT_URL "https://github.com/webui-dev/webui/raw/main/examples/C%2B%2B/virtual_file_system/vfs.py")
set(VFS_SCRIPT_PATH "${OUTPUT_WEB_DIR}/vfs.py")
set(VFS_HEADER "${OUTPUT_WEB_DIR}/vfs.h")
set(NPM_STAMP "${CMAKE_CURRENT_BINARY_DIR}/npm_install.stamp")

# ---- Frontend inputs ----
file(GLOB_RECURSE FRONTEND_SOURCE_FILES CONFIGURE_DEPENDS
        "${FRONTEND_SRC}/src/*.js"
        "${FRONTEND_SRC}/src/*.ts"
        "${FRONTEND_SRC}/src/*.vue"
        "${FRONTEND_SRC}/src/*.css"
        "${FRONTEND_SRC}/public/*"
)

set(FRONTEND_CONFIG_FILES
        "${FRONTEND_SRC}/index.html"
        "${FRONTEND_SRC}/package.json"
        "${FRONTEND_SRC}/package-lock.json"
        "${FRONTEND_SRC}/tsconfig.json"
        "${FRONTEND_SRC}/vite.config.ts"
)

file(MAKE_DIRECTORY "${OUTPUT_WEB_DIR}")
file(MAKE_DIRECTORY "${FRONTEND_BIN}")

# ---- Download vfs.py once ----
if (NOT EXISTS "${VFS_SCRIPT_PATH}")
    message(STATUS "Downloading vfs.py from ${VFS_SCRIPT_URL}")
    file(DOWNLOAD "${VFS_SCRIPT_URL}" "${VFS_SCRIPT_PATH}"
            STATUS download_status
            TLS_VERIFY ON
            SHOW_PROGRESS)
    list(GET download_status 0 status_code)
    list(GET download_status 1 status_message)
    if (NOT status_code EQUAL 0)
        message(FATAL_ERROR "Failed to download vfs.py (${status_code}): ${status_message}")
    endif()
endif()

# ---- npm install ----
add_custom_command(
        OUTPUT "${NPM_STAMP}"
        COMMAND "${NPM}" install --no-audit --no-fund
        COMMAND "${CMAKE_COMMAND}" -E touch "${NPM_STAMP}"
        WORKING_DIRECTORY "${FRONTEND_SRC}"
        DEPENDS
        "${FRONTEND_SRC}/package.json"
        "${FRONTEND_SRC}/package-lock.json"
        COMMENT "Installing npm dependencies"
        VERBATIM
)

# ---- Building a Vue frontend ----
add_custom_command(
        OUTPUT "${FRONTEND_BIN}/index.html"
        COMMAND "${NPM}" run build -- --outDir "${FRONTEND_BIN}" --emptyOutDir
        WORKING_DIRECTORY "${FRONTEND_SRC}"
        DEPENDS
        "${NPM_STAMP}"
        ${FRONTEND_SOURCE_FILES}
        ${FRONTEND_CONFIG_FILES}
        COMMENT "Building Vue frontend into ${FRONTEND_BIN}"
        VERBATIM
)

# ---- Generating vfs.h from the built frontend ----
add_custom_command(
        OUTPUT "${VFS_HEADER}"
        COMMAND Python3::Interpreter "${VFS_SCRIPT_PATH}" "${FRONTEND_BIN}" "${VFS_HEADER}"
        DEPENDS
        "${VFS_SCRIPT_PATH}"
        "${FRONTEND_BIN}/index.html"
        COMMENT "Generating VFS header from ${FRONTEND_BIN}"
        VERBATIM
)

# ---- Declare targets ----
add_custom_target(frontend
        DEPENDS "${FRONTEND_BIN}/index.html"
        COMMENT "Frontend are up to date"
)

add_custom_target(frontend-vfs
        DEPENDS "${VFS_HEADER}"
        COMMENT "Frontend and VFS header are up to date"
)
