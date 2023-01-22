import { defineConfig } from 'cypress'

export default defineConfig({
  
  e2e: {
    'baseUrl': 'http://localhost:4200',
    supportFile: false
  },
  viewportWidth: 1600,
  viewportHeight: 1024
  
})