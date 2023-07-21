/*eslint-disable*/

const stripe = Stripe(
  'pk_test_51NVv1eDU40huhhPI4XMsEenzGaZjExNVSCn6NHCCLy5XmsXkEYKIskcYEcdM15HIlk0cl2NPALyMKimmfD5mGBcV00YrvKAEGQ'
);

const bookbtn = document.getElementById('book-tour');
// console.log(bookbtn);

const bookTour = async tourID => {
  //1) Get checkout session from API
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);
    // console.log(session);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    alert('error', error);
  }
};

if (bookbtn) {
  bookbtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const tourID = e.target.dataset.tourid;
    bookTour(tourID);
  });
}
