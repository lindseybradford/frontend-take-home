type DateFormatOptions = {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
};

export const formatDate = (dateString: string, options: DateFormatOptions) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
