# Python Sandbox Test

This is a test markdown file to demonstrate the Python code sandbox feature.

## Simple Example

Here's a simple Python code example:

```python
print("Hello, World!")
for i in range(5):
    print(f"Number: {i}")
```

## Math Example

Here's an example that performs some mathematical operations:

```python
import math

# Calculate the area of a circle
radius = 5
area = math.pi * radius ** 2
print(f"The area of a circle with radius {radius} is {area:.2f}")

# Calculate the Fibonacci sequence
def fibonacci(n):
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(f"Fibonacci sequence (10 numbers): {fibonacci(10)}")
```

## Data Visualization Example

This example would create a simple visualization (but note that it won't work in the sandbox as it requires matplotlib which may not be installed):

```python
# This is just for demonstration purposes
# In a real environment with matplotlib installed, this would create a plot
print("Simulating a data visualization:")
data = [3, 7, 9, 4, 2, 8, 5]
print("Data:", data)
print("ASCII Visualization:")
for value in data:
    print("*" * value)
```

## Error Handling Example

This example demonstrates error handling:

```python
try:
    # This will cause a division by zero error
    result = 10 / 0
    print(f"Result: {result}")
except Exception as e:
    print(f"An error occurred: {e}")

print("This code still runs after the error")
```
