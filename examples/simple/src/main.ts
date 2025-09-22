// Simple TypeScript file to test transformation
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'Test User',
  age: 25
}

// Use some modern JavaScript features
const greet = (user: User): string => {
  return `Hello, ${user.name}! You are ${user.age} years old.`
}

// Optional chaining and nullish coalescing
const optionalUser: User | null = Math.random() > 0.5 ? user : null
const greeting = greet(optionalUser ?? { name: 'Anonymous', age: 0 })

console.log(greeting)

// Export for module
export { user, greet }
