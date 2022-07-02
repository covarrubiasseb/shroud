const ChannelNav = (props) => {
  return (
    <ul>
      {
        props.channelList.map((channel, idx) => {
          return (
            <li key={idx+1}>{channel.name}</li>
          );
        })
      }
    </ul>
  );
}

export default ChannelNav;