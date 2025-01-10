# SocialMatrix

This is my **Calculus AB Final Project**! The idea is to **visualize and explore** social networks using **matrices**. It’s a simple React.JS web application where you can:

- **Add people** to a network  
- **Generate random connections** between them  
- **View** how those connections look in a **graph**  
- **Use matrices** to combine or modify multiple networks  

I built this website to show how **matrix operations** (like addition, subtraction, and multiplication) can directly be applied to a social network.

---

## How It Works

1. **Networks A & B**  
   - You can manually add people or let the app create a *random* set of people and friendships.  
   - Each person shows up as a node in the network.  
   - Friendships show up as edges between nodes.

2. **Matrix Operations**  
   - Each network can be turned into an **adjacency matrix**.  
   - Adding or removing people changes the matrix size.  
   - **A + B** merges edges from both networks.  
   - **A - B** keeps edges that are only in A.  
   - **A × B** shows two-step paths (“friend-of-a-friend” type connections).

3. **Result Graph**  
   - After a matrix operation, see the **combined** or **modified** network in the “Result Graph.”  
   - Tables show the **adjacency matrix**, each person’s **friend count**, and **friend suggestions** based on mutual friends.

---

## Why It’s Useful (and Fun)

- **Visual Learning**: Matrices can be hard to picture, so seeing them affect a social network helps.  
- **Friend Suggestions**: Demonstrates how 2-step paths can hint at potential new friendships.  
- **Easy Experimentation**: Create random networks, apply matrix operationss, and see instant results.

---

## Technologies Used
- React.JS for the UI
- D3.js for the graph visualization
- Tailwind CSS for styling
