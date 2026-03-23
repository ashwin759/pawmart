# AI-Powered Pet Marketplace Web Application

## Complete Project Prompt / Specification

## 1. Project Overview

Develop a **full-stack web application similar to an e-commerce
marketplace** where customers can browse, learn about, and purchase pets
from a specific pet store.

The platform must function like a **pet-focused marketplace**,
providing: - Pet listings - Breed characteristics - Diet
recommendations - Purchase functionality - Smart breed recommendations -
AI-powered assistance

The system should also include **user authentication and an admin
dashboard** for store management.

------------------------------------------------------------------------

# 2. Core Objective

Build a **public web platform** that allows customers to:

1.  Search for pets by breed or name
2.  View complete breed characteristics
3.  View diet and care information
4.  Check store availability
5.  Purchase or reserve pets
6.  Receive recommendations if the breed is unavailable
7.  Interact with an AI assistant for pet advice

------------------------------------------------------------------------

# 3. User Roles

The system will support two main roles:

## 3.1 Customer (User)

Customers can:

-   Register an account
-   Log in to the platform
-   Search pets or breeds
-   View breed characteristics
-   View diet information
-   Purchase pets
-   View order history
-   Ask AI questions about pets

## 3.2 Admin

Admin users manage the system.

Admin capabilities:

-   Add new pets
-   Update pet information
-   Remove pets
-   Upload pet images
-   Add breed information
-   Add diet information
-   View customer orders
-   Manage inventory
-   Use AI assistance for generating pet information

------------------------------------------------------------------------

# 4. Functional Requirements

## 4.1 User Authentication System

### User Registration

Users must provide:

-   Name
-   Email
-   Phone number
-   Address
-   Password

### Login System

Users log in using:

-   Email
-   Password

Security requirements:

-   Password hashing
-   Session management
-   Secure authentication

------------------------------------------------------------------------

# 5. Pet Marketplace Features

## Pet Listing Page

Display pets with:

-   Pet name
-   Breed
-   Age
-   Price
-   Gender
-   Availability
-   Image

Example:

Pet Card - Image - Breed Name - Age - Price - Buy Now button

------------------------------------------------------------------------

# 6. Breed Information Page

When a breed is selected, show:

### Breed Characteristics

-   Breed name
-   Origin
-   Size
-   Weight
-   Lifespan
-   Temperament
-   Activity level
-   Description

Example:

Breed: Golden Retriever\
Origin: Scotland\
Lifespan: 10--12 years\
Temperament: Friendly, intelligent, loyal

------------------------------------------------------------------------

# 7. Diet Information

Each breed must display recommended food information.

Diet details include:

-   Age group
-   Food type
-   Feeding frequency
-   Water requirement

Example:

Puppy Diet: - High protein puppy food - Boiled chicken - Rice

Feeding Frequency: 3 times per day

------------------------------------------------------------------------

# 8. Smart Search System

Users can search by:

-   Breed name
-   Pet name
-   Keywords

Example searches:

Golden Retriever\
Retriever\
Small apartment dog

The system should return:

-   Matching breeds
-   Breed characteristics
-   Diet details
-   Store availability

------------------------------------------------------------------------

# 9. Breed Recommendation System

If a breed is **not available in the store**, the system must recommend
similar breeds.

Similarity should be based on:

-   Breed group
-   Size
-   Temperament
-   Activity level

Example:

User searches: Golden Retriever

If unavailable:

Recommended breeds: - Labrador Retriever - Flat-Coated Retriever -
Chesapeake Bay Retriever

------------------------------------------------------------------------

# 10. Purchase Flow

Customer purchase process:

1.  Search for a pet
2.  View breed information
3.  Check availability
4.  Login/Register
5.  Add pet to cart
6.  Confirm purchase
7.  Store order in database

------------------------------------------------------------------------

# 11. Admin Dashboard

Admin must have a separate login page.

Admin features:

### Pet Management

-   Add pet
-   Edit pet
-   Delete pet
-   Upload pet images

### Breed Management

-   Add breed characteristics
-   Update breed information

### Diet Management

-   Add diet information
-   Update feeding details

### Order Management

-   View customer orders
-   Accept or reject orders

------------------------------------------------------------------------

# 12. AI Features (Using Qwen)

The system should integrate an AI model to provide intelligent
assistance.

## 12.1 AI Pet Recommendation

Users can ask:

Example: "I live in an apartment and want a friendly dog."

AI should suggest breeds and return:

-   Breed name
-   Temperament
-   Size
-   Care difficulty

------------------------------------------------------------------------

## 12.2 AI Pet Care Assistant

Users can ask questions such as:

-   What should I feed a Labrador puppy?
-   Is a Beagle good for apartments?
-   How often should I feed a retriever?

AI should return clear pet care guidance.

------------------------------------------------------------------------

## 12.3 Natural Language Breed Search

Users can search using natural language:

Examples:

"small dog with low maintenance"

System returns:

-   Pug
-   Shih Tzu
-   French Bulldog

------------------------------------------------------------------------

# 13. Database Design

## Table: Users

-   user_id
-   name
-   email
-   phone
-   address
-   password_hash

------------------------------------------------------------------------

## Table: Admin

-   admin_id
-   username
-   email
-   password_hash

------------------------------------------------------------------------

## Table: Breeds

-   breed_id
-   breed_name
-   origin
-   size
-   temperament
-   lifespan
-   description

------------------------------------------------------------------------

## Table: Diet

-   diet_id
-   breed_id
-   age_group
-   food
-   feeding_frequency

------------------------------------------------------------------------

## Table: Pets

-   pet_id
-   breed_id
-   age
-   price
-   gender
-   availability
-   image_url

------------------------------------------------------------------------

## Table: Orders

-   order_id
-   user_id
-   pet_id
-   order_date
-   order_status

------------------------------------------------------------------------

# 14. Recommended Technology Stack

Frontend: - HTML - CSS - JavaScript - React

Backend: - Python - FastAPI

Database: - PostgreSQL

AI Model: - Qwen

Hosting: - Cloud hosting platform

------------------------------------------------------------------------

# 15. System Architecture

Frontend ↓ Authentication Layer ↓ Backend API ↓ Database ↓ AI Service
(Qwen)

------------------------------------------------------------------------

# 16. Security Requirements

The system must implement:

-   Password hashing
-   HTTPS
-   Input validation
-   Role-based access control
-   Admin authentication

------------------------------------------------------------------------

# 17. Optional Enhancements

Additional improvements:

-   Pet recommendation quiz
-   AI-generated pet diet plans
-   Pet care articles
-   Customer reviews
-   Image gallery for pets
-   Chat support

------------------------------------------------------------------------

# 18. Final Deliverable

A **full-stack AI-powered pet marketplace platform** that includes:

-   Pet marketplace
-   Breed information system
-   Diet recommendation system
-   User login and authentication
-   Admin dashboard
-   AI pet advisor
-   Breed recommendation engine

The application must be **publicly accessible and scalable for
real-world usage**.
