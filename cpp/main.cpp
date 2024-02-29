#include <iostream>
#include <utilities.hpp>

int main()
{
  int a = 1;
  int b = 2;
  int c = addNums(a, b);

  std::cout << a << " + " << b << " = " << c << std::endl;
  return 0;
}