set(VFS_SCRIPT_URL "https://github.com/webui-dev/webui/raw/main/examples/C%2B%2B/virtual_file_system/vfs.py")
set(VFS_SCRIPT_PATH "${CMAKE_CURRENT_BINARY_DIR}/vfs.py")
set(SOURCE_WEB_DIR "${CMAKE_CURRENT_SOURCE_DIR}/source/web")
set(OUTPUT_WEB_DIR "${CMAKE_CURRENT_BINARY_DIR}/web")
set(VFS_HEADER "${OUTPUT_WEB_DIR}/vfs.h")

if(NOT EXISTS "${VFS_SCRIPT_PATH}")
    file(DOWNLOAD "${VFS_SCRIPT_URL}" "${VFS_SCRIPT_PATH}"
            STATUS download_status
            TLS_VERIFY ON)
    list(GET download_status 0 status_code)
    if(NOT status_code EQUAL 0)
        message(FATAL_ERROR "Failed to download vfs.py: ${download_status}")
    endif()
endif()

file(MAKE_DIRECTORY "${OUTPUT_WEB_DIR}")

add_custom_target(generate_vfs
        COMMAND Python3::Interpreter "${VFS_SCRIPT_PATH}" "${SOURCE_WEB_DIR}" "${VFS_HEADER}"
        DEPENDS "${VFS_SCRIPT_PATH}"
        COMMENT "Running vfs.py to generate the virtual file system header file"
        VERBATIM
)
