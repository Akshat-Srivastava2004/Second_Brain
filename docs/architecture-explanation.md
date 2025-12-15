                                         System Architecture Explanation (SECOND_BRAIN)

The system follows a scalable AI-driven architecture for processing PDFs and audio files. Users interact with the application through a web app. All requests first pass through a Load Balancer, which distributes traffic across multiple Backend API Servers, allowing the system to handle high concurrent users efficiently.

When a user uploads a PDF or audio file, the API server temporarily stores the file in Temporary Storage. PDF files are processed using pdfjs, while audio files are transcribed into text using AssemblyAI. The extracted text is then converted into vector embeddings using Gemini/Groq and stored in MongoDB Vector Search.

For user queries, the API server retrieves relevant vector chunks from MongoDB and sends them to the LLM, which generates a contextual response. The final answer is returned to the user through the web app.