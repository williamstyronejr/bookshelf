import type { NextPage } from 'next';
import * as React from 'react';
import Input from '../../../../components/Input';
import { validateBook } from '../../../../utils/validation';

const EditBookPage: NextPage = () => {
  const [fieldErrors, setFieldErrors] = React.useState<any>({});
  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateBook(fields);
    if (!valid) return setFieldErrors(errors);
  };

  return (
    <section>
      <form className="" onSubmit={handleSubmit}>
        <fieldset>
          <Input
            name="title"
            type="text"
            label="Title"
            placeholder="Title"
            error={fieldErrors.title}
          />

          <Input
            type="text"
            name="author"
            label="Author"
            placeholder="Author"
            error={fieldErrors.title}
          />
        </fieldset>

        <button className="bg-custom-btn-submit text-white" type="submit">
          Update Book
        </button>
      </form>
    </section>
  );
};

EditBookPage.auth = {
  admin: true,
};

export default EditBookPage;
