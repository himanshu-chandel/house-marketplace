import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';
import { list } from 'firebase/storage';
import { map } from '@firebase/util';
function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const useEffectRan = useRef(false);

  const navigate = useNavigate();

  const params = useParams();

  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    };

    if (!useEffectRan.current) {
      fetchListing();
    }

    return function cleanUp() {
      useEffectRan.current = true;
    };
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      {/* SlideShow */}
      <Swiper
        className='swiper-container'
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
      >
        {listing.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className='swiperSlideDiv'
              style={{
                background: `url(${listing.imageUrls[index]}) center no-repeat`,
                backgroundSize: 'cover',
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);

          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt='shareIcon' />
      </div>
      {shareLinkCopied && (
        <p className='linkCopied'>Link copied to clipboard</p>
      )}
      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} -{' '}
          {listing.offer
            ? listing.discountedPrice.toLocaleString('en-IN', {
                maximumFractionDigits: 0,
                style: 'currency',
                currency: 'INR',
              })
            : listing.regularPrice.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                style: 'currency',
                currency: 'INR',
              })}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          For {listing.type === 'rent' ? 'rent' : 'sale'}
        </p>
        {listing.offer && (
          <p className='discountPrice'>
            {(listing.regularPrice - listing.discountedPrice).toLocaleString(
              'en-IN',
              {
                maximumFractionDigits: 0,
                style: 'currency',
                currency: 'INR',
              }
            )}{' '}
            Discount
          </p>
        )}
        <ul className='listingDetailsList'>
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>
        <p className='listingLocationTitle'>Location</p>
        {/* Map */}
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}
export default Listing;
