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
  pageCount,
  isbn13,
  copiesCount,
}: {
  title?: string;
  author?: string;
  pageCount?: string;
  isbn13?: string;
  copiesCount?: string;
}) {
  const errors: {
    title?: string;
    author?: string;
    pageCount?: string;
    isbn13?: string;
    copiesCount?: string;
  } = {};

  if (typeof title === 'string') {
    if (title === '') errors.title = 'Must provided a book title';
  } else {
    errors.title = 'Must provide a book title';
  }

  if (typeof author === 'string') {
    const authorId = parseInt(author.toString());
    if (isNaN(authorId)) errors.author = 'Must provide an author.';
  } else {
    errors.author = 'Must provided an author.';
  }

  if (typeof pageCount === 'string') {
    const numOfPages = parseInt(pageCount.toString());
    if (isNaN(numOfPages) || numOfPages < 0) {
      errors.pageCount = 'Number of pages must be a postive number.';
    }
  } else {
    errors.pageCount = 'Must provided number of pages';
  }

  if (typeof isbn13 === 'string') {
    if (isbn13 === '') errors.isbn13 = 'Invalid isbn13 number';
  } else {
    errors.isbn13 = "Must provided the book's isbn13 number.";
  }

  if (typeof copiesCount === 'string') {
    const numOfCopies = parseInt(copiesCount);

    if (isNaN(numOfCopies) || numOfCopies < 0) {
      errors.copiesCount = 'Number of copies must be a positive number.';
    }
  } else {
    errors.copiesCount = 'Must provided number of copies.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

/**
 * Valdiation rules for  creating or updating author. Optional will list all
 *  fields as optional.
 * @param param Fields to be validated
 * @param optional Flag indicating if fields are optional.
 * @returns Return a valid flag and error list.
 */
export function validateAuthor(
  { name, bio }: { name: string; bio: string },
  optional = false
) {
  const errors: {
    name?: string;
    bio?: string;
  } = {};

  if (typeof name === 'string') {
    if (name === '') "Must provide the author's name";
  } else if (!optional) {
    errors.name = "Must provide the author's name";
  }

  if (typeof bio === 'string') {
    if (bio.length > 1000) errors.bio = 'Must be less than 1000 characters';
  }

  return {
    valid: Object.keys(errors).length > 0,
    errors,
  };
}
