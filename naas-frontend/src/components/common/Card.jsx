import React from 'react';
import { Card as MuiCard, CardContent, CardMedia, CardActions, Typography, styled } from '@mui/material';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const Card = ({
  title,
  subtitle,
  content,
  image,
  actions,
  children,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      {image && (
        <StyledCardMedia
          image={image}
          title={title}
        />
      )}
      <StyledCardContent>
        {title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" color="text.primary">
            {content}
          </Typography>
        )}
        {children}
      </StyledCardContent>
      {actions && (
        <StyledCardActions>
          {actions}
        </StyledCardActions>
      )}
    </StyledCard>
  );
};

export default Card; 