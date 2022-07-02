const ServerNav = (props) => {
  return (
    <ul>
      {
        props.serverList.map((server,idx) => {
          return (
            <li key={idx+1}><button onClick={props.serverNavHandler} data-id={server.serverId} data-index={idx}>Server {idx+1}</button></li>
          );
        })
      }
    </ul>
  );
}

export default ServerNav;