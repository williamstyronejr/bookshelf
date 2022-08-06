export function validateUser({
  username,
  password,
  email,
  confirmPassword,
}: {
  username?: string;
  password?: string;
  email?: string;

  confirmPassword?: string;
}) {
  const errors: {
    username?: string;
    password?: string;
    email?: string;
    confirmPassword?: string;
  } = {};

  if (username !== undefined) {
    if (username.length > 16 || username.length < 4) {
      errors.username = 'Username must be between 4 and 16 characters';
    }
  } else {
    errors.username = 'Must provide a username.';
  }

  if (password !== undefined) {
    if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }
  } else {
    errors.password = 'Must provide a password';
  }

  if (email !== undefined) {
    if (!email.includes('@')) {
      errors.email = 'Provide a valid email';
    }
  } else {
    errors.email = 'Must provide an email';
  }

  if (confirmPassword !== undefined) {
    if (password === undefined) {
      errors.confirmPassword = 'Must provide a password';
    } else {
      if (confirmPassword !== password)
        errors.confirmPassword = 'Password do not match.';
    }
  } else {
    errors.confirmPassword = 'Password do not match.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
