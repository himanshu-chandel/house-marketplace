import { useState, useEffect, useRef } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from '../components/ListingItem';

function Profile() {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setLisitings] = useState(null);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const useEffectRan = useRef(false);

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setLisitings(listings);
      setLoading(false);
    };

    if (!useEffectRan.current) {
      fetchUserListings();
    }

    return () => {
      useEffectRan.current = true;
    };
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      // Update in firebase
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }
      // Update in fireStore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: name,
      });
    } catch (error) {
      toast.error('Could Not Update Profile Updates');
    }
  };

  const onChange = (e) => {
    setFormData((previousState) => ({
      ...previousState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      await deleteDoc(doc(db, 'listings', listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setLisitings(updatedListings);
      toast.success('Listing deleted sucessfully');
    }
  };

  const onEdit = async (listingId) => navigate(`/edit-listing/${listingId}`);

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((previousState) => !previousState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className='profileCard'>
          <form>
            <input
              type='text'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              id='name'
              value={name}
              onChange={onChange}
            />
            <input
              type='text'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              id='email'
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or Rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
export default Profile;
