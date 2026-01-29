Statement of Work
AKUA INC.- BLOCKCHAIN INTEGRATION PROJECT 
April 2, 2025 | Version 1.3 
SMARTLEDGER BLOCKCHAIN SOLUTIONS INC. 
251 Little Falls Dr. 
Wilmington, DE 19808-1674 
CAGE: 10HF4 
UEI: C5RUDT3WS844 
EIN: 87-4133317 
RE: Statement of Work for Blockchain Integration with AKUA Dear AKUA Team, 
We are pleased to present this Statement of Work (SOW), which outlines the scope, methodology, and projected costs for SmartLedger’s blockchain integration with AKUA’s logistics infrastructure. Our proposed solution harnesses secure cryptographic modules and real-time, verifiable logging of device data—powered by a scalable, enterprise-grade blockchain framework. 
The primary objective of this engagement is to establish a tamper-evident, transparent, and highly efficient operational environment for AKUA’s sensor-driven supply chain. By leveraging blockchain, we aim to deliver sustained trust, enhanced automation, and alignment with regulatory best practices. 
We look forward to working closely with your team to bring this innovative solution to life. 
Warm regards, 
Shawn Ryan 
Co-Founder & CEO 
SmartLedger – The world’s leading blockchain distribution channel 
Executive Summary 
SmartLedger is pleased to submit this Statement of Work (SOW) to support AKUA in integrating scalable blockchain infrastructure to secure data communications, device identity, and immutable log integrity. This project will deliver a robust and scalable solution for ensuring cryptographic signed, tamper-evident data logging. 
Purpose: 
The purpose of this SOW is to define the services, deliverables, and milestones associated with the design, deployment, and support of blockchain integration within AKUA’s logistics framework. Upon execution, Smartledger agrees to deliver all components listed herein under a fixed milestone-based structure. 
Scope of Work: 
SmartLedger will provide the following deliverables: 
1.Docker container for JSON Hashing & Blockchain Publishing 
2.Simulation, Integration, and Testing 
3.Deployment to AKUA Infrastructure 
4.Training and Documentation 
1. Docker container for JSON Hashing & Blockchain Publishing 
Tech Stack: Node.js, Smartledger blockchain JS Library, Smartledger blockchain API, RabbitMQ 
Function: 
Listens to RabbitMQ for incoming IoT device JSON payloads. 
Hashes JSON strings using SHA-256. 
Publishes the hash to the SmartLedger blockchain Node API. 
Packages and returns a JSON object including: 
Original JSON data 
SHA-256 hash of data 
Transaction ID (TXID) of the published hash 
Publish JSON object to RabbitMQ
2. Simulation, Integration & Testing Framework: 
Test-ready environment that: 
Simulates IoT JSON payloads for end-to-end flow validation 
Integrates with the Hashing & Blockchain Publishing module via RabbitMQ Performs automated unit and integration tests for hashing accuracy and TXID response. 
Logs results and provides performance metrics for optimization and debugging Ensures system reliability and readiness prior to production deployment. 
3. Deployment to AKUA Infrastructure: 
Provide Docker Container with Custom JSON Hash Blockchain Publishing Services Configure environment variables, and API endpoints for production readiness Validate full system functionality post-deployment, including successful blockchain publishing, response verification 
Ensures operational integration with AKUA’s infrastructure for live use. 4. Training & Documentation 
Provide comprehensive technical documentation covering system architecture, setup, usage, and maintenance 
Deliver user guides for interacting with the JSON hashing and publishing module Conduct training session(s) for AKUA technical team on system operations, troubleshooting, and best practices 
Include API references, configuration instructions, and example payloads Ensures smooth knowledge transfer and supports long-term maintainability.
Budget Allocation & Payment Structure 

Assumptions: 
AKUA infrastructure supports integration with APIs and docker containers Blockchain cost efficiency is maintained through optimized transaction formats Each phase includes AKUA acceptance checkpoints before payment release
