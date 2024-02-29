#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif


EXTERN EMSCRIPTEN_KEEPALIVE int addNums(int a, int b)
{
  return (a + b);
}