/**
 * Validate check for password field. Empty strings will return error message
 *  even for optional check.
 * @param password String to validate as a password
 * @param optional Flag indicating if password is optional
 * @returns Returns a string if invalid, otherwise null.
 */
function validatePassword(password: string | undefined, optional = false) {
  if (optional && password === undefined) return null;

  if (password !== undefined) {
    if (password.length < 4) {
      return 'Password must be at least 4 characters.';
    }
  } else {
    return 'Must provide a password';
  }

  return null;
}

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

  const passwordResults = validatePassword(password, true);
  if (passwordResults) errors.password = passwordResults;

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

export function validateNewPassword({
  oldPassword,
  newPassword,
  confirmPassword,
}: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const errors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  } = {};

  const oldResults = validatePassword(oldPassword);
  const newResults = validatePassword(newPassword);

  if (oldResults) errors.oldPassword = oldResults;
  if (newResults) errors.newPassword = newResults;
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function validateBook({
  title,
  author,
}: {
  title: string;
  author: string;
}) {
  const errors: {
    title?: string;
    author?: string;
  } = {};

  if (typeof title === 'string') {
    if (title === '') errors.title = 'Must provided a book title';
  } else {
    errors.title = 'Must provide a book title';
  }

  if (typeof author === 'string') {
    if (author === '') errors.author = 'Must provide an author.';
  } else {
    errors.author = 'Must provided an author.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
