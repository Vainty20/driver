import DatePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Toast } from 'toastify-react-native';
import { useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { 
  View,
  Text,
  TextInput, 
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView
 } from 'react-native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    motorcycleModel: '',
    motorcycleRegNo: '',
    password: '',
    showPassword: false,
    birthdate: new Date(),
    showDatePicker: false,
    phoneNumber: '',
    confirmPassword: '',
    showConfirmPassword: false,
    isApprovedDriver: false
  });
  const [role] = useState('driver');
  const [loading, setLoading] = useState(false);

  const MIN_AGE = 18;

  const isValidFirstName = () => /^[a-zA-Z]+$/.test(form.firstName) && !/\d/.test(form.firstName) && !/[^a-zA-Z0-9]/.test(form.firstName);
  const isValidLastName = () => /^[a-zA-Z]+$/.test(form.lastName) && !/\d/.test(form.lastName) && !/[^a-zA-Z0-9]/.test(form.lastName);
  const isValidPhoneNumber = () => /^09\d{9}$/.test(form.phoneNumber);
  const isStrongPassword = () => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(form.password);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.birthdate;
    setForm({ ...form, showDatePicker: false, birthdate: currentDate });
  };

  const showDatepicker = () => {
    setForm({ ...form, showDatePicker: true });
  };

  const togglePasswordVisibility = () => {
    setForm({ ...form, showPassword: !form.showPassword });
  };

  const toggleConfirmPasswordVisibility = () => {
    setForm({ ...form, showConfirmPassword: !form.showConfirmPassword });
  };

  const handleSignUp = async () => {
    if (loading) return;

    const { firstName, lastName, email, password, confirmPassword, birthdate, motorcycleModel, motorcycleRegNo, phoneNumber } = form;

    if (!isValidFirstName()) {
      return Toast.error('Invalid First Name! First Name should only contain letters');
    }

    if (!isValidLastName()) {
      return Toast.error('Invalid Last Name! Last Name should only contain letters');
    }

    if (!isValidPhoneNumber()) {
      return Toast.error('Invalid Phone Number! Phone number should start with 09 and be 11 digits long.');
    }

    if (password !== confirmPassword) {
      return Toast.error('Passwords do not match!');
    }

    if (!isStrongPassword()) {
      return Toast.error('Weak Password! Password should be at least 8 characters long and contain at least one letter and one number.');
    }

    let currentDate = new Date();
    let age = currentDate.getFullYear() - birthdate.getFullYear();

    if (
      currentDate.getMonth() < birthdate.getMonth() ||
      (currentDate.getMonth() === birthdate.getMonth() && currentDate.getDate() < birthdate.getDate())
    ) {
      age--;
    }

    if (age < MIN_AGE) {
      return Toast.error(`You must be at least ${MIN_AGE} years old to register!`);
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const userData = {
        firstName: firstName,
        lastName: lastName,
        birthdate: birthdate,
        motorcycleModel: motorcycleModel,
        motorcycleRegNo: motorcycleRegNo,
        phoneNumber: phoneNumber,
        role,
        isApprovedDriver: false,
      };

      const userDocRef = doc(db, 'drivers', userCredential.user.uid);

      await setDoc(userDocRef, userData);
      await sendEmailVerification(userCredential.user);

      Toast.success('You have successfully created an account! Please check your email for verification.');

      navigation.replace('Login');
    } catch (error) {
      let errorMessage = 'Error creating an account. Please try again later.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please enter a valid email.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Account creation is currently not allowed. Please try again later.';
      }

      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView >
      <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={form.firstName}
        onChangeText={(text) => setForm({ ...form, firstName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={form.lastName}
        onChangeText={(text) => setForm({ ...form, lastName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.input} onPress={showDatepicker}>
        <Text>Birthdate: {form.birthdate.toDateString()}</Text>
      </TouchableOpacity>
      {form.showDatePicker && (
        <DatePicker
          testID="datePicker"
          value={form.birthdate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Motorcycle Model"
        value={form.motorcycleModel}
        onChangeText={(text) => setForm({ ...form, motorcycleModel: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Motorcycle Reg No"
        value={form.motorcycleRegNo}
        onChangeText={(text) => setForm({ ...form, motorcycleRegNo: text })}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          secureTextEntry={!form.showPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Icon name={form.showPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          secureTextEntry={!form.showConfirmPassword}
        />
        <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
          <Icon name={form.showConfirmPassword ? 'eye-slash' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? <ActivityIndicator size={25} color="white"/> : 'Register'}</Text>
      </TouchableOpacity>
      <Text style={styles.additionalText}>
        By providing your email address, you agree to our{' '}
        <Text style={styles.privacyPolicyText}>Privacy Policy</Text> and{' '}
        <Text style={styles.privacyPolicyText}>Terms of Service</Text>
      </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  passwordInput: {
    flex: 1,
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#0066cc',
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  additionalText: {
    width: '80%',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
  },
  privacyPolicyText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});
