install(
    TARGETS zuno_exe
    RUNTIME COMPONENT zuno_Runtime
)

if(PROJECT_IS_TOP_LEVEL)
  include(CPack)
endif()
