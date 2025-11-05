
# Research Planner

This is a Next.js starter in Firebase Studio. To get started, take a look at `src/app/page.tsx`.

## Features

This application, **Research Planner**, uses AI to help you draft and refine a research study plan.

## Setup Instructions

### 1. Gemini API Key (Required for AI)

All AI features are powered by the Gemini models. To use the application, you must provide your own Gemini API key.

1.  **Get Your Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to obtain your free API key.
2.  **Enter Your Key**: Paste your key into the input field in the application's header. The key is used for your current session and is not stored.

## Publishing & Associated Costs

When you publish this application, there are two primary services to be aware of regarding costs. The good news is that the application is designed to operate well within the free tier of these services.

### 1. Firebase App Hosting

Your Next.js application is hosted on Firebase App Hosting.

*   **Free Tier:** Firebase provides a generous free tier that includes a certain amount of:
    *   **CPU & Memory:** Processing power for your single server instance.
    *   **Data Storage:** Space to store your application's code.
    *   **Data Egress:** Network traffic for sending data to your users.
    For a new application with low to moderate traffic, you will likely stay within these free limits.
*   **Paid Usage:** You only pay for what you use beyond the free tier. Costs will scale with the number of users and the amount of traffic your application receives.

### 2. Google AI Platform (Gemini API)

This application is designed for users to provide their **own** Gemini API key. This means that **you, as the app publisher, will not incur any costs for the AI usage**. The costs are instead borne by the end-user, based on their personal usage and their own Google AI Platform account.

### How to Stay Within the Free Tier

It is wise to be proactive about cost management. Here are the key checkpoints to help you stay within the Firebase free tier:

1.  **Limit Server Instances:** The most effective way to prevent unexpected costs is to limit the number of server instances. Your application is already configured for this in the `apphosting.yaml` file with `maxInstances: 1`. This ensures your app won't automatically scale up and incur costs from high traffic.

2.  **Monitor Your Usage:** Regularly check the "Usage and billing" dashboard in the [Firebase Console](https://console.firebase.google.com/). This will show you how close you are to the free tier limits for services like App Hosting.

3.  **Set Up Budget Alerts:** For peace of mind, create a budget alert in your [Google Cloud Billing account](https://console.cloud.google.com/billing). You can set it to notify you by email when your usage reaches a certain percentage of a budget you define (e.g., $1), so you are never caught by surprise.

By following these guidelines, you can confidently host your application with minimal to no cost.
