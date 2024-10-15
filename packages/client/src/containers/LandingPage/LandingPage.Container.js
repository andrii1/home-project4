/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';

import { apiURL } from '../../apiURL';
import './LandingPage.Style.css';

export const LandingPage = () => {
  const [exampleResources, setExampleResources] = useState([]);
  // const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchExampleResources() {
      const response = await fetch(`${apiURL()}/exampleResources`);
      const examples = await response.json();
      setExampleResources(examples);
    }

    fetchExampleResources();
  }, []);

  // useEffect(() => {
  //   async function fetchImages() {
  //     const response = await fetch(`${apiURL()}/cloudinary/images`);
  //     const json = await response.json();

  //     setImages(json.resources[0].url);
  //   }

  //   fetchImages();
  // }, []);

  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ];

  return (
    <div className="landing-page-container">
      <span>Landing Page</span>
      {exampleResources.map((example) => (
        <div key={example.id}>{example.title}</div>
      ))}
      123
      <div className="container-image-gallery-dealview">
        {/* <ImageGallery thumbnailHeight="50px" items={images} /> */}
      </div>
      {/* <div
        className="card-image"
        style={{
          backgroundImage: `url(${images})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          height: '200px',
          border: '1px',
        }}
      />
      {images} */}
    </div>
  );
};
