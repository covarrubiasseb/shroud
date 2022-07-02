const ChannelNav = (props) => {
  return (
    <ul>
      {
        props.channelList.map((channel, idx) => {
          return (
            <li key={idx+1}><button onClick={props.channelNavHandler} data-channel={idx}>{channel.name}</button></li>
          );
        })
      }
    </ul>
  );
}

export default ChannelNav;