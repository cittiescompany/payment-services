import 'dotenv/config';
import axios from 'axios';
import crypto from 'crypto';
import { uploadImageFromUrl } from './upload_media.js';
import fs from 'fs';

export let formated_media = (user_id) => [
  {
    media:
      'https://res.cloudinary.com/daruz/image/upload/v1719830152/image3333333333333333_myiq48.jpg',
    user_id,
    type: 'cover_img',
  },
  {
    media:
      'https://res.cloudinary.com/daruz/image/upload/v1719830152/image3333333333333333_myiq48.jpg',
    user_id,
    type: 'profile_pic',
  },
];

const social_media_credentials = {
  instagram: {
    url: `${process.env.RAPID_IN_HOST}/user/feed/v2?`,
    host: process.env.RAPID_IN_HOST,
    key: process.env.RAPID_IN_API_KEY,
    res_key: 'items',
  },
  linkedin: {
    url: `${process.env.RAPID_LI_HOST}/get-profile-posts`,
    host: process.env.RAPID_LI_HOST,
    key: process.env.RAPID_LI_API_KEY,
    res_key: 'data',
  },
  twitter: {
    url: `${process.env.RAPID_TI_HOST}/user/tweets`,
    host: process.env.RAPID_TI_HOST,
    key: process.env.RAPID_TI_API_KEY,
    res_key: 'results',
  },
};

export const social_media_data = async (
  user_name,
  user_id,
  social_media = 'instagram'
) => {
  const isTwitter = social_media == 'twitter';
  const options = {
    method: isTwitter ? 'POST' : 'GET',
    url: `https://${social_media_credentials[social_media].url}`,
    params: isTwitter ? null : { username: user_name },
    data: isTwitter
      ? {
          username: user_name,
          include_replies: false,
          include_pinned: false,
        }
      : undefined,
    headers: {
      'x-rapidapi-host': social_media_credentials[social_media].host,
      'x-rapidapi-key': social_media_credentials[social_media].key,
    },
  };
  try {
    const data = [];
    const response = await axios
      .request(options)
      .catch((error) => console.log(error.message));
    const key = social_media_credentials[social_media].res_key;
    const collector = response?.data[key];
    if (!collector?.length) return data;
    if (social_media == 'instagram') {
      const uploads = collector
        .filter((iterator) => iterator.image_versions2)
        .map(async (iterator) => {
          const image = iterator.image_versions2.candidates[0].url;
          const fileName = `${crypto.randomUUID()}image.jpg`;
          const url = await uploadImageFromUrl(image, fileName);
          return {
            media: url,
            is_image: true,
            type: 'instagram media',
            user_id,
          };
        });
      data = await Promise.all(uploads);
    }
    if (social_media == 'twitter' || social_media == 'linkedin') {
      const loopMedia = collector
        .filter((iterator) => iterator?.media_url || iterator?.image)
        .flatMap((iterator) =>
          social_media === 'twitter' ? iterator.media_url : iterator.image
        );
      try {
        const uploadedImages = await Promise.all(
          loopMedia.map(async (item) => {
            const imageUrl = social_media === 'twitter' ? item : item.url;
            return {
              media: await uploadImageFromUrl(
                imageUrl,
                `${randomUUID()}image.jpg`
              ),
              is_image: true,
              type: `${social_media} media`,
              user_id,
            };
          })
        );
        data.push(...uploadedImages);
      } catch (error) {
        console.error(error.message);
        throw new Error('Failed to fetch the file from URL');
      }
    }

    return data;
  } catch (error) {
    console.log(error.message);
    console.error(error);
  }
};

export const generate_otp = (min = 1000, max = 9999) =>
  Math.floor(Math.random() * (max - min)) + min;

const suffixes = [
  'pro',
  'official',
  'elite',
  'master',
  'guru',
  'champ',
  'alpha',
  'omega',
  'legend',
  'xpert',
  'ninja',
  'hero',
  'wizard',
  'boss',
  'creator',
  'innovator',
  'genius',
  '2024',
  '2025',
  'nextgen',
  'vortex',
  'prime',
  'supreme',
];

export function generateUsername(name) {
  return `${name.replace(/\s+/g, '').toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}${suffixes[(Math.random() * suffixes.length) | 0]}`;
}

export const citties =(prop)=>{
  try{
    const fileContent= fs.readFileSync( 'countries.json', 'utf8');
    const data = JSON.parse(fileContent);
    return data[prop]

  }catch(error){
    console.log(error.message)
  }
};
