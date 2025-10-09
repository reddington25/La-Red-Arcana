# Implementation Plan - Red Arcana MVP

## Task List

- [x] 1. Initialize Next.js project with core dependencies and configuration

  - Create Next.js 14+ project with App Router and TypeScript
  - Install and configure Tailwind CSS with custom theme (Orbitron font, red/black color scheme)
  - Set up project structure with organized directories (app, components, lib, types, supabase)
  - Configure PWA manifest.json and service worker for Progressive Web App functionality
  - Set up environment variables structure (.env.local.example)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Set up Supabase backend infrastructure

  - Create Supabase project and configure connection
  - Write database migration for complete schema (users, contracts, offers, reviews, messages, admin_messages, disputes, withdrawal_requests)
  - Implement Row Level Security (RLS) policies for all tables
  - Configure Supabase Storage buckets (contract-files, payment-qrs, user-documents) with access policies
  - Set up Supabase Auth with Google OAuth provider
  - _Requirements: 1.1, 12.1, 12.2, 12.3_

- [x] 3. Implement authentication system with role-based registration

- [x] 3.1 Create authentication utilities and Supabase client configuration

  - Set up Supabase client for client components and server components
  - Create authentication helper functions (signInWithGoogle, signOut, getSession)
  - Implement auth middleware for protected routes
  - _Requirements: 1.1, 1.2_

- [x] 3.2 Build login page with Google OAuth

  - Create login page UI with Google sign-in button
  - Implement OAuth callback handler
  - Add redirect logic based on user verification status
  - _Requirements: 1.1, 1.9_

- [x] 3.3 Build role-specific registration forms

  - Create student registration form (real name, alias, WhatsApp)
  - Create specialist registration form (real name, WhatsApp, CI upload, CV upload, university, career, academic status, subject tags)
  - Implement file upload to Supabase Storage for CI and CV
  - Create user record with is_verified=false after form submission
  - _Requirements: 1.3, 1.4, 1.5, 13.1, 13.2_

- [x] 3.4 Create "account pending verification" screen

  - Build waiting screen UI shown to unverified users
  - Display verification status message
  - _Requirements: 1.6_

- [x] 4. Build homepage with conversion-optimized structure

- [x] 4.1 Implement Matrix Rain background animation

  - Create canvas-based Matrix Rain component with Chinese characters
  - Optimize animation performance for mobile devices
  - Make background fixed across entire homepage
  - _Requirements: 10.1, 10.2_

- [x] 4.2 Create Hero Section with glitch effect

  - Implement GlitchText component with CSS animations for "Red Arcana" title
  - Add persuasive slogan text
  - Create CTA buttons (Login, Register as Student, Apply as Specialist)
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 4.3 Build "How It Works" section

  - Create 4-step process cards with icons and descriptions
  - Add specialist recruitment hook text at the end
  - _Requirements: 10.4_

- [x] 4.4 Implement Social Proof section with mock data

  - Create horizontal scrolling carousel for featured specialists (5 mock profiles)
  - Build platform metrics display (3 key statistics)
  - Implement real-time activity feed with mock contract data
  - Create testimonials grid with 3 student reviews
  - _Requirements: 10.4_

- [x] 4.5 Create FAQ section with accordion

  - Implement accordion component for 6 FAQ items
  - Add comprehensive answers about payment, anonymity, disputes, verification, application, and commissions
  - _Requirements: 10.4_

- [x] 4.6 Build Final CTA section

  - Create visually distinct final call-to-action block
  - Add registration buttons for both roles
  - _Requirements: 10.5_

- [x] 5. Create admin panel for user verification

- [x] 5.1 Build admin dashboard layout

  - Create admin-only route group with authentication check
  - Build navigation for verification queue, escrow management, disputes, and badge management
  - _Requirements: 8.1_

- [x] 5.2 Implement verification queue interface

  - Display list of pending users (is_verified=false) with their submitted data
  - Show different information for students vs specialists
  - Add "Verify User" button that updates is_verified to true
  - Implement notification system to inform user of verification
  - _Requirements: 1.7, 1.8, 8.2, 8.3_

- [x] 5.3 Create badge management interface

  - Build UI to view all verified specialists
  - Add "Grant Garantía Arcana Badge" button that updates has_arcana_badge
  - Display current badge holders
  - _Requirements: 8.7, 14.1, 14.2_

- [x] 6. Implement contract creation and management for students

- [x] 6.1 Build contract creation form

  - Create form with fields: title, description, file uploads, subject tags, service type, initial price
  - Implement multi-file upload to Supabase Storage
  - Validate form inputs (title length, description length, price range)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.8_

- [x] 6.2 Implement contract submission and specialist notification

  - Save contract to database with status="open"
  - Trigger Supabase Edge Function to send email notifications to matching specialists
  - Redirect student to contract detail page
  - _Requirements: 2.6, 2.7, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 6.3 Create student dashboard

  - Display list of student's contracts with status indicators
  - Show contract cards with title, status, price, and number of offers
  - Add navigation to create new contract
  - _Requirements: 2.1, 2.8_

- [x] 6.4 Build contract detail page for students

  - Display full contract information and uploaded files
  - Show list of received offers with specialist info (alias, rating, badge, price)
  - Implement "Accept Offer" button that updates contract status to "assigned" then "pending_deposit"
  - _Requirements: 2.8, 2.9, 3.1, 3.2, 14.4_

- [x] 7. Create Supabase Edge Function for email notifications

  - Write Edge Function that queries specialists with matching tags
  - Integrate with email service (Resend or similar) to send notifications
  - Include contract details and direct link in email
  - Handle errors gracefully without blocking contract creation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 8. Build specialist opportunities panel and counteroffer system

- [x] 8.1 Create opportunities dashboard for specialists

  - Query and display contracts with status="open" matching specialist's tags
  - Show contract cards with title, description, tags, service type, initial price
  - Implement filtering and sorting options
  - _Requirements: 4.1, 4.2, 4.3, 13.7_

- [x] 8.2 Build contract detail page for specialists

  - Display full contract information and downloadable files
  - Show counteroffer form (price, optional message)
  - Implement offer submission that creates record in offers table
  - _Requirements: 4.3, 4.4, 12.5, 12.6_

- [x] 8.3 Create specialist dashboard

  - Display sections: active contracts, completed contracts, current balance
  - Show contract status and progress
  - Add "Request Withdrawal" button that notifies admin
  - Calculate and display balance after 15% commission
  - _Requirements: 4.6, 4.7, 4.8, 4.9_

- [x] 9. Implement admin-user communication channel for escrow

- [x] 9.1 Create admin_messages table and interface

  - Build chat-like interface for admin to communicate with specific users
  - Implement message sending with optional file attachment (for QR codes)
  - Display unread message indicators
  - _Requirements: 3.3, 3.4_

- [x] 9.2 Build escrow management dashboard for admins

  - Display contracts with status="pending_deposit"
  - Show student information and contract details
  - Add "Send QR" button that uploads QR image and sends message to student
  - Implement "Confirm Payment" button that updates contract status to "in_progress"
  - _Requirements: 3.2, 3.5, 8.4, 8.5_

- [x] 9.3 Create withdrawal request management

  - Display pending withdrawal requests from specialists
  - Show specialist balance and requested amount
  - Add "Process Withdrawal" button to mark request as completed
  - _Requirements: 4.8, 8.6_

- [x] 10. Build real-time chat system for active contracts

- [x] 10.1 Implement contract chat component

  - Create chat UI with message list and input field
  - Use Supabase Realtime subscriptions for live message updates
  - Enable chat only when contract status="in_progress"
  - Display messages with sender identification and timestamps
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 10.2 Implement work delivery mechanism

  - Add file upload for specialist to submit completed work
  - Create "Mark as Completed" button for student
  - Update contract status to "completed" and calculate specialist balance
  - _Requirements: 3.7, 3.8, 3.9_

- [x] 10.3 Create Supabase Edge Function for message cleanup

  - Write scheduled function to delete messages from contracts completed >7 days ago
  - Set up cron trigger to run daily
  - _Requirements: 6.4, 6.5_

- [x] 11. Implement mandatory review system

- [x] 11.1 Create review modal component

  - Build modal with star rating (1-5) and comment textarea
  - Prevent modal dismissal until review is submitted
  - Show modal to both student and specialist after contract completion
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 11.2 Implement review submission and rating calculation

  - Save review to reviews table
  - Calculate and update user's average_rating
  - Display reviews on user profiles
  - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [x] 12. Build dispute system with admin mediation

- [x] 12.1 Create dispute initiation interface

  - Add "Initiate Dispute" button on contract page (visible for 7 days after completion)
  - Build dispute form with reason textarea
  - Update contract status to "disputed" and create dispute record
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12.2 Implement admin dispute review panel

  - Display list of active disputes
  - Show dispute details with full contract history and messages
  - Create resolution interface with action options (refund, pay, partial)
  - Update dispute status and execute payment action based on admin decision
  - _Requirements: 7.5, 7.6, 7.7, 8.1_

- [x] 13. Create user profile management

- [x] 13.1 Build profile edit page

  - Display current profile information
  - Allow students to edit: alias, WhatsApp
  - Allow specialists to edit: WhatsApp, CV, subject tags, academic status
  - Prevent editing of: email, real name, CI photo
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 13.2 Implement re-verification flow for sensitive changes

  - Mark WhatsApp changes as "pending verification"
  - Notify admin of changes requiring re-verification
  - Update field only after admin confirms
  - _Requirements: 16.6, 16.7, 16.8_

- [x] 14. Implement super admin functionality

  - Create super admin panel with admin management section
  - Build interface to create new admin accounts
  - Add ability to modify admin permissions
  - Implement admin account deactivation
  - Create audit log for super admin actions
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 15. Add responsive design and mobile optimization

  - Ensure all components are mobile-first and fully responsive
  - Test touch interactions on all interactive elements
  - Optimize images and assets for mobile bandwidth
  - Verify PWA functionality (add to home screen, offline capability)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [x] 16. Implement error handling and user feedback

  - Create global error boundary component
  - Add error handling for Supabase operations
  - Implement user-facing error messages
  - Add loading states for async operations
  - Create toast notifications for success/error feedback
  - _Requirements: All requirements (cross-cutting concern)_

- [x] 17. Set up deployment and environment configuration

  - Configure Vercel project and connect GitHub repository
  - Set up environment variables in Vercel dashboard
  - Configure Supabase production environment
  - Deploy Edge Functions to Supabase
  - Test OAuth redirect URLs in production
  - Verify file upload/download in production

  - Set up Vercel Analytics
  - _Requirements: All requirements (deployment)_
