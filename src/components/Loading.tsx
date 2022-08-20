const Loading = ({ text }: { text?: string }) => {
  return <div className="">{text ? <div className="">{text}</div> : null}</div>;
};

export default Loading;
