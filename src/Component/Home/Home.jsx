import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Spin, Typography, message, Input, Pagination } from 'antd';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

// ✅ Custom debounce function
function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const Home = () => {
  const navigate = useNavigate();
  const [allPokemonBasic, setAllPokemonBasic] = useState([]); // store all pokemon {name, url}
  const [pokemonList, setPokemonList] = useState([]); // detailed pokemon data to display
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchText, setSearchText] = useState('');
  // computed minHeight for spinner (viewport minus header/footer)
  const [containerMinHeight, setContainerMinHeight] = useState('60vh');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Fetch all pokemon basic info once
  useEffect(() => {
    // compute spinner container height on mount and resize
    const updateContainerMinHeight = () => {
      try {
        const header = document.querySelector('.site-header');
        const footer = document.querySelector('.site-footer');
        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        const available = window.innerHeight - headerH - footerH;
        // keep a sensible minimum so very small viewports don't collapse
        setContainerMinHeight(`${Math.max(available, 300)}px`);
      } catch {
          setContainerMinHeight('60vh');
        }
    };

    updateContainerMinHeight();
    window.addEventListener('resize', updateContainerMinHeight);
    // cleanup
    const remover = () => window.removeEventListener('resize', updateContainerMinHeight);
    const fetchAllPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
        const data = await response.json();
        setAllPokemonBasic(data.results); // array of {name, url}
        setTotal(data.count);
      } catch (error) {
        message.error('Failed to load Pokémon data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPokemon();
    return remover;
  }, []);

  // Fetch detailed pokemons for a page (normal pagination)
  const fetchPokemons = async (page = 1) => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`);
      const data = await response.json();

      const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );

      setPokemonList(detailedData);
      setNotFound(false);
    } catch (error) {
      message.error('Failed to load Pokémon list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Effect: Run when searchText changes
  useEffect(() => {
    if (searchText === '') {
      // When search cleared, reset to page 1 and fetch normal page
      setCurrentPage(1);
      fetchPokemons(1);
      setNotFound(false);
    } else {
      // Filter allPokemonBasic by substring match
      const filtered = allPokemonBasic.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchText.toLowerCase())
      );

      if (filtered.length === 0) {
        setPokemonList([]);
        setNotFound(true);
        return;
      }

      // Fetch details for first 20 filtered pokemons
      const fetchFilteredDetails = async () => {
        setLoading(true);
        try {
          const limitedFiltered = filtered.slice(0, 20);
          const detailedData = await Promise.all(
            limitedFiltered.map(async (pokemon) => {
              const res = await fetch(pokemon.url);
              return res.json();
            })
          );
          setPokemonList(detailedData);
          setNotFound(false);
        } catch (error) {
          message.error('Failed to fetch Pokémon details');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchFilteredDetails();
    }
  }, [searchText, allPokemonBasic]);

  // Effect: fetch page data when currentPage changes (only if no search)
  useEffect(() => {
    if (searchText === '') {
      fetchPokemons(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearchText(val.trim());
    }, 500),
    []
  );

  const onSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="home-page">
      <Title level={2} className="home-title">Pokémon Gallery</Title>

      <div className="search-box">
        <Search
          placeholder="Search Pokémon by name"
          allowClear
          onChange={onSearchChange}
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div
          className="spinner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: containerMinHeight,
            width: '100%'
          }}
        >
          <Spin size="large" />
        </div>
      ) : notFound ? (
        <p style={{ textAlign: 'center', marginTop: 50 }}>No Pokémon found.</p>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {pokemonList.map((pokemon) => (
            <Col xs={24} sm={12} md={8} lg={6} key={pokemon.id}>
              <Card
                hoverable
                title={
                  <Link
                    to={`/pokemon/${pokemon.id}?tab=images`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer', color: '#1890ff', fontWeight: 600 }}
                    title={`View images for ${pokemon.name}`}
                  >
                    {pokemon.name.toUpperCase()}
                  </Link>
                }
                cover={
                  <div
                    onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <img
                      alt={pokemon.name}
                      src={pokemon.sprites.other['official-artwork'].front_default}
                      style={{ height: 200, objectFit: 'contain' }}
                    />
                  </div>
                }
              >
                <p><strong>ID:</strong> {pokemon.id}</p>
                <p><strong>Type:</strong> {pokemon.types.map(t => t.type.name).join(', ')}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Show pagination only when not searching */}
      {searchText === '' && !loading && !notFound && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
