
set( SRC src/addNums.cpp)

if (CMAKE_SYSTEM_NAME STREQUAL Emscripten)

  add_executable(application wasm-entry.cpp ${SRC}) 
  target_include_directories(application PUBLIC include)
  
  set(CMAKE_EXECUTABLE_SUFFIX .js)
  # Generate a ES6 Javascript preamble ⬇️
  #set(CMAKE_EXECUTABLE_SUFFIX .mjs)

  target_link_options(application PRIVATE -sNO_EXIT_RUNTIME=1)
  #target_link_options(application PRIVATE -sEXPORT_NAME='PuzzleSolver')
  target_link_options(application PRIVATE -sENVIRONMENT='web')
  target_link_options(application PRIVATE -sUSE_ES6_IMPORT_META=0)
  # Embedd WASM inside .js output
  target_link_options(application PRIVATE -sSINGLE_FILE=1)
  target_link_options(application PRIVATE -sEXPORTED_RUNTIME_METHODS=['ccall','cwrap'])
  target_link_options(application PRIVATE -sMODULARIZE=1)
  target_link_options(application PRIVATE -sEXPORTED_FUNCTIONS='_addNums')
  #target_link_options(application PRIVATE -sEVAL_CTORS=2)

  # set(BASE_NAME <TARGET_FILE_BASE_NAME:application>)
  # set(SUFFIX "$<TARGET_FILE_SUFFIX:application>")
  # set(CFG "$<CONFIG>")
  # set(TARGET_WEBPACK_JS "${PROJECT_SOURCE_DIR}/src/${BASE_NAME}_${CFG}${SUFFIX}")
  set(DESTINATION "${PROJECT_SOURCE_DIR}/src")
  add_custom_command(TARGET application POST_BUILD
    COMMAND echo "Copying $<TARGET_FILE:application> to ${DESTINATION}"
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:application> ${DESTINATION}
    #COMMAND ${CMAKE_COMMAND} -E copy ${TARGET_DIR}/${TARGET_NAME}.wasm ${DESTINATION}
    DEPENDS $<TARGET_FILE:application>
  )
else()
  add_executable(application main.cpp ${SRC})
  target_include_directories(application PUBLIC include)

endif()