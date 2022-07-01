// export const acquireToken = () => {
//   return getToken(messaging, { vapidKey: 'BD-LK3XNcjaacGNGLEEpj0APe2YY0BzFv6Dnle3lZC-ncP-XHCD5-zlQcSnTciJjVjURBQUkShrOB2uOnO5Elv0'})
//          .then((currentToken) => {

//             if (currentToken) {
//               console.log('accepted');
//             } else {
//               console.log('denied');
//             }

//          }).catch((err) => {
//           console.log(err);
//          });
// }

// export const onMessageListener = () => {
//   return onMessage(messaging, payload => {
//     console.log('Received foreground message ', payload);
//      // Customize notification here
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//       body: payload.notification.body,
//     };
//   });

// };