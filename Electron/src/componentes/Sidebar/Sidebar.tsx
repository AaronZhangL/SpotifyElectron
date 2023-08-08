import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Global from 'global/global';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './sideBarCss.module.css';
import Playlist from './Playlist/Playlist';
import ModalAddSongPlaylist from './ModalAddSongPlaylist/ModalAddSongPlaylist';
import defaultThumbnailPlaylist from '../../assets/imgs/DefaultThumbnailPlaylist.jpg';
import { PropsPlaylist } from './types/propsPlaylist.module';

interface PropsSidebar {
  triggerReloadSidebar: boolean;
}

export default function Sidebar(props: PropsSidebar) {
  //* MENU HOVER

  const [listItemInicio, setHoverInicio] = useState('');
  const [listItemBuscar, setHoverBuscar] = useState('');

  const [isHoveredInicio, setIsHovered] = useState(false);
  const [isHoveredBuscar, setIsHoveredBuscar] = useState(false);

  const handleMouseOverInicio = () => {
    setIsHovered(true);
  };

  const handleMouseOutInicio = () => {
    setIsHovered(false);
  };

  const handleMouseOverBuscar = () => {
    setIsHoveredBuscar(true);
  };

  const handleMouseOutBuscar = () => {
    setIsHoveredBuscar(false);
  };

  useEffect(() => {
    setHoverInicio(isHoveredInicio ? styles.linksubtle : '');
    setHoverBuscar(isHoveredBuscar ? styles.linksubtle : '');
  }, [isHoveredBuscar, isHoveredInicio]);

  //* HIGHLIGHT CURRENT SECTION LI

  const [selectedID, setSelectedID] = useState<string>(); // you could set a default id as well

  const getSelectedClass = (id: string) =>
    selectedID === id ? styles.linksubtleClicked : '';

  const [url, setUrl] = useState('/');

  useEffect(() => {
    // console.log(url)
    if (url === '/') {
      setSelectedID('li-inicio');
    } else if (url === '/explorar') {
      setSelectedID('li-buscar');
    } else {
      setSelectedID('');
    }
  }, [url]);

  const handleUrlInicioClicked = () => {
    setUrl('/');
    setSelectedPlaylist('');
  };

  const handleUrlBuscarClicked = () => {
    setUrl('/explorar');
    setSelectedPlaylist('');
  };

  const handleUrlPlaylistClicked = (name: string) => {
    setUrl('');
    setSelectedPlaylist(name); // Actualizar el estado cuando se hace clic en una playlist
  };

  //* PLAYLISTS

  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(''); // Estado para almacenar el nombre de la playlist seleccionada

  const [playlists, setPlaylists] = useState<PropsPlaylist[]>();

  const [loading, setLoading] = useState(true);

  const handlePlaylists = () => {
    fetch(`${Global.backendBaseUrl}playlists/`, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.playlists) {
          const propsPlaylists: PropsPlaylist[] = [];

          for (let obj of res.playlists) {
            obj = JSON.parse(obj);
            const propsPlaylist: PropsPlaylist = {
              name: obj.name,
              photo: obj.photo === '' ? defaultThumbnailPlaylist : obj.photo,
              handleUrlPlaylistClicked,
              reloadSidebar: handlePlaylists,
              playlistStyle: '',
            };

            propsPlaylists.push(propsPlaylist);
          }
          setPlaylists(propsPlaylists);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        console.log('No se pudieron obtener las playlists');
      });
  };

  useEffect(() => {
    handlePlaylists();
  }, []);

  /* triggered when other component wants to reload the sidebar */
  useEffect(() => {
    handlePlaylists();
  }, [props.triggerReloadSidebar]);

  return (
    <div className={`container-fluid ${styles.wrapperNavbar}`}>
      <header className={`${styles.header}`}>
        <ul className={`${styles.ul}`}>
          <Link to="/">
            <li
              className={`${
                styles.headerLi
              } ${listItemInicio} ${getSelectedClass('li-inicio')} `}
              onMouseOver={handleMouseOverInicio}
              onMouseOut={handleMouseOutInicio}
              onClick={handleUrlInicioClicked}
              id="li-inicio"
            >
              <i className={`fa-solid fa-house fa-fw ${styles.headerI}`} />
              <span className={`${styles.headerI}`}>Inicio</span>
            </li>
          </Link>
          <Link to="/explorar" className={`${styles.aHeader}`}>
            <li
              className={`${
                styles.headerLi
              } ${listItemBuscar} ${getSelectedClass('li-buscar')}`}
              onMouseOver={handleMouseOverBuscar}
              onMouseOut={handleMouseOutBuscar}
              onClick={handleUrlBuscarClicked}
              id="li-buscar"
            >
              <i
                className={`fa-solid fa-magnifying-glass fa-fw ${styles.headerI}`}
              />
              <span className={`${styles.headerI}`}>Buscar</span>
            </li>
          </Link>
        </ul>
      </header>

      <div
        className={`container-fluid d-flex flex-column ${styles.libraryWrapper}`}
      >
        <div
          className={`container-fluid d-flex flex-column p-0 ${styles.playlistUlWrapper}`}
        >
          <header
            className={`container-fluid d-flex flex-row pb-4 ${styles.headerTuBiblioteca}`}
          >
            <div className="container-fluid d-flex justify-content-start p-0">
              <div className="container-fluid ps-0">
                <i className="fa-solid fa-swatchbook fa-fw" />
                Tu biblioteca
              </div>
            </div>

            <div
              className="container-fluid d-flex justify-content-end p-0"
              style={{ width: '25%' }}
            >
              <ModalAddSongPlaylist reloadSidebar={handlePlaylists} />
            </div>
          </header>
          <ul
            className={`container-fluid d-flex flex-column ${styles.ulPlaylist}`}
          >
            {loading && (
              <div
                className="container-fluid d-flex justify-content-center align-content-center"
                style={{
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularProgress
                  style={{ width: '3rem', height: 'auto' }}
                  sx={{
                    ' & .MuiCircularProgress-circle': {
                      color: 'var(--pure-white)',
                    },
                    '& .css-zk81sn-MuiCircularProgress-root': {
                      width: '3rem',
                    },
                  }}
                />
              </div>
            )}

            {!loading &&
              playlists &&
              playlists.map((playlist) => {
                const urlPlaylist = `/playlist/${playlist.name}`;

                // Agregar una condición para aplicar un estilo diferente si la playlist es la seleccionada
                const playlistStyle =
                  playlist.name === selectedPlaylist
                    ? styles.selectedPlaylist
                    : '';

                return (
                  <Link to={urlPlaylist} key={playlist.name}>
                    <Playlist
                      handleUrlPlaylistClicked={handleUrlPlaylistClicked}
                      name={playlist.name}
                      photo={playlist.photo}
                      playlistStyle={playlistStyle} // Pasar el estilo como prop
                      reloadSidebar={handlePlaylists}
                    />
                  </Link>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
