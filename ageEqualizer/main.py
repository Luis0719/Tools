#!/usr/bin/env python3
import math

c = 299792.458 #SPEED_LIGHT do not change
time_diff = 35 # Time gap between traveler and observer
t = 365 # Traveler's travel time
ti = t + time_diff # Observer's time

def sqr(n):
  return n ** 2

def calc():
  op1 = math.sqrt(sqr(ti) - sqr(t))
  op2 = op1 / ti
  v = op2 * c

  print(f"{(op2*100):.5f}%c")
  print(f"{v:.2f} km/s")

def main():
  calc()

main()