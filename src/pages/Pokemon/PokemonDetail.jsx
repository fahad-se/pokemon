import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Spin, Button, Tag, Progress, Tabs } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, ThunderboltOutlined, DashboardOutlined } from '@ant-design/icons';
import './PokemonDetail.css';

const { TabPane } = Tabs;

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  // Removed unused evolutionChain state
  const [loading, setLoading] = useState(true);

  const getTypeColor = (type) => {
    return `type-${type.toLowerCase()}`;
  };

  const getStatColor = (statValue) => {
    if (statValue >= 150) return '#52c41a';
    if (statValue >= 100) return '#1890ff';
    if (statValue >= 70) return '#faad14';
    return '#ff4d4f';
  };

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        // Fetch basic pokemon data
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemonData = await pokemonResponse.json();
        setPokemon(pokemonData);

        // Fetch species data
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        setSpecies(speciesData);

        // Fetch evolution chain (removed, not used)
        // const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        // const evolutionData = await evolutionResponse.json();
        // setEvolutionChain(evolutionData);
      } catch (error) {
        console.error('Failed to fetch Pokémon details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!pokemon) {
    return <div>Pokémon not found</div>;
  }

  return (
    <div className="pokemon-detail">
      <Button 
        className="back-button"
        type="primary" 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Back to Gallery
      </Button>

      <div className="pokemon-image-container">
        <img
          className="pokemon-image"
          alt={pokemon.name}
          src={pokemon.sprites.other['official-artwork'].front_default}
        />
      </div>
      
      <h1 className="pokemon-title">{capitalizeFirst(pokemon.name)} #{String(pokemon.id).padStart(3, '0')}</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {pokemon.types.map((type) => (
          <span
            key={type.type.name}
            className={`type-tag ${getTypeColor(type.type.name)}`}
          >
            {type.type.name}
          </span>
        ))}
      </div>

      <Tabs defaultActiveKey="1" centered>
        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              Stats
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]}>
            {pokemon.stats.map(stat => (
              <Col xs={24} sm={12} key={stat.stat.name}>
                <Card className="pokemon-card">
                  <h4>{capitalizeFirst(stat.stat.name.replace('-', ' '))}</h4>
                  <Progress
                    percent={(stat.base_stat / 255) * 100}
                    strokeColor={getStatColor(stat.base_stat)}
                    format={() => stat.base_stat}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HeartOutlined />
              Details
            </span>
          }
          key="2"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="pokemon-card" title="Physical">
                <p><strong>Height:</strong> {pokemon.height / 10}m</p>
                <p><strong>Weight:</strong> {pokemon.weight / 10}kg</p>
                <p><strong>Base Experience:</strong> {pokemon.base_experience}</p>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="pokemon-card" title="Abilities">
                {pokemon.abilities.map((ability, index) => (
                  <Tag 
                    key={ability.ability.name}
                    color={ability.is_hidden ? 'volcano' : 'blue'}
                    style={{ margin: '5px' }}
                  >
                    {capitalizeFirst(ability.ability.name.replace('-', ' '))}
                    {ability.is_hidden && ' (Hidden)'}
                  </Tag>
                ))}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Moves
            </span>
          }
          key="3"
        >
          <Row gutter={[16, 16]}>
            {pokemon.moves.slice(0, 8).map((move) => (
              <Col xs={24} sm={12} md={8} key={move.move.name}>
                <Card className="pokemon-card move-card" size="small">
                  <h4>{capitalizeFirst(move.move.name.replace('-', ' '))}</h4>
                  <p>Learned at level: {
                    move.version_group_details[0].level_learned_at || 'TM/TR'
                  }</p>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      {species && (
        <Card className="pokemon-card" style={{ marginTop: '24px' }}>
          <p className="section-title">Pokédex Entry</p>
          <p>
            {species.flavor_text_entries
              .find(entry => entry.language.name === 'en')
              ?.flavor_text.replace(/\\f/g, ' ')
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default PokemonDetail;