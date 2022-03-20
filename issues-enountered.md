1. Working with async / await functions
   A. 'await' only works in async functions

2. forEach is asynchornous. Code flow was flowing down while the forEach was being executed.
   A. Used for-of instead and that solved the issue

3. Configuring Microsoft Graph API Endpoint to send emails securely
   A. Attempting to use Nodemailer instead.
   B. https://spin.atomicobject.com/2021/10/08/microsoft-graph-api-node/
   C. https://docs.microsoft.com/en-us/graph/auth-register-app-v2
   D. https://docs.microsoft.com/en-us/graph/auth-v2-service
   E. https://zimmergren.net/sending-e-mails-using-microsoft-graph-using-dotnet/
