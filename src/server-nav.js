const ServerNav = (props) => {
  return (
    <ul>
      {
        props.serverList.map((serverId,idx) => {
          return (
            <li key={idx+1}><button onClick={props.serverNavHandler} data-id={serverId}>Server {idx+1}</button></li>
          );
        })
      }
    </ul>
  );
}

export default ServerNav;