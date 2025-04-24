import React from 'react';
import { Button as MuiButton, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  minWidth: '120px',
  height: '48px',
  padding: '0 24px',
  fontSize: '1rem',
  fontWeight: 500,
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
  minWidth: '120px',
  height: '48px',
  padding: '0 24px',
  fontSize: '1rem',
  fontWeight: 500,
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  ...props
}) => {
  const buttonProps = {
    variant,
    color,
    size,
    fullWidth,
    disabled: disabled || loading,
    startIcon,
    endIcon,
    onClick,
    ...props,
  };

  if (loading) {
    return (
      <StyledLoadingButton
        loading
        loadingPosition="center"
        {...buttonProps}
      >
        {children}
      </StyledLoadingButton>
    );
  }

  return (
    <StyledButton {...buttonProps}>
      {children}
    </StyledButton>
  );
};

export default Button; 