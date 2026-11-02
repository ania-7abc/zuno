# Parent project does not export its library target, so this CML implicitly
# depends on being added from it, i.e. the testing is done only from the build
# tree and is not feasible from an install location

project(zunoTests LANGUAGES CXX)

# ---- Tests ----

add_executable(zuno_test source/zuno_test.cpp)
target_link_libraries(zuno_test PRIVATE zuno_lib)
target_compile_features(zuno_test PRIVATE cxx_std_20)

add_test(NAME zuno_test COMMAND zuno_test)

# ---- End-of-file commands ----

add_folders(Test)
