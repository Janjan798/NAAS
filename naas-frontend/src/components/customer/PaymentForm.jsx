import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  styled,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import Card from '../common/Card';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const validationSchema = Yup.object({
  cardNumber: Yup.string()
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  cardHolder: Yup.string()
    .required('Card holder name is required'),
  expiryDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Use format MM/YY')
    .required('Expiry date is required'),
  cvv: Yup.string()
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
});

const PaymentForm = ({ amount, onSuccess }) => {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Handle payment processing here
        console.log('Processing payment:', values);
        onSuccess && onSuccess();
      } catch (error) {
        console.error('Payment failed:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <Card>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Amount to pay: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount)}
        </Typography>
      </Box>

      <StyledPaper>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="cardNumber"
                name="cardNumber"
                label="Card Number"
                value={formik.values.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  formik.setFieldValue('cardNumber', formatted);
                }}
                error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                inputProps={{ maxLength: 19 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="cardHolder"
                name="cardHolder"
                label="Card Holder Name"
                value={formik.values.cardHolder}
                onChange={formik.handleChange}
                error={formik.touched.cardHolder && Boolean(formik.errors.cardHolder)}
                helperText={formik.touched.cardHolder && formik.errors.cardHolder}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="expiryDate"
                name="expiryDate"
                label="Expiry Date (MM/YY)"
                value={formik.values.expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    const formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                    formik.setFieldValue('expiryDate', formatted);
                  } else {
                    formik.setFieldValue('expiryDate', value);
                  }
                }}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="cvv"
                name="cvv"
                label="CVV"
                type="password"
                value={formik.values.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  formik.setFieldValue('cvv', value);
                }}
                error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                helperText={formik.touched.cvv && formik.errors.cvv}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                loading={formik.isSubmitting}
              >
                Pay Now
              </Button>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Card>
  );
};

export default PaymentForm; 