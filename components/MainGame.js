'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '/src/app/page.module.css';

const MainGame = () => {
  const [checklist, setChecklist] = useState(null);
  const [dateTimeString, setDateTimeString] = useState('');

  async function parseDateTime(dateTimeString) {
    // Parse the input string to create a Date object
    const dateObject = new Date(dateTimeString);

    // Format the date
    const optionsDate = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formattedDate = dateObject.toLocaleDateString('en-US', optionsDate);

    // Format the time
    const optionsTime = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const formattedTime = dateObject.toLocaleTimeString('en-US', optionsTime);

    return {
      date: formattedDate,
      time: formattedTime,
    };
  }

  useEffect(() => {
    async function fetchRandomChecklistWithBirds() {
      let checklistWithBirds = null;

      while (!checklistWithBirds) {
        const randomSubId = generateRandomSubId();
        const response = await axios.get(`https://api.ebird.org/v2/product/checklist/view/S101892190`, {
          headers: {
            'X-eBirdApiToken': 'ipqf2as8d67j',
          },
        });

        if (response.data.obs && response.data.obs.length >= 7) {
          checklistWithBirds = response.data;
          setDateTimeString(checklistWithBirds.obs[0].obsDt);
        }
      }

      // Enrich the checklistWithBirds with common names
      const enrichedChecklist = await enrichChecklistWithCommonNames(checklistWithBirds);

      setChecklist(enrichedChecklist);
    }

    async function enrichChecklistWithCommonNames(checklist) {
      // Make an API call for each species code to get the common name
      const promises = checklist.obs.map(async (observation) => {
        const commonName = await getCommonName(observation.speciesCode);
        return {
          ...observation,
          commonName: commonName || 'Common name not found',
        };
      });

      // Wait for all promises to resolve
      const enrichedObs = await Promise.all(promises);

      // Enrich the checklist with common names
      const enrichedChecklist = {
        ...checklist,
        obs: enrichedObs,
      };

      return enrichedChecklist;
    }

    async function getCommonName(speciesCode) {
      try {
        const response = await axios.get(
          `https://api.ebird.org/v2/ref/taxonomy/ebird?species=${speciesCode}&version=2019`,
          {
            headers: {
              'X-eBirdApiToken': 'ipqf2as8d67j',
            },
          }
        );

        // Extract the common name from the response
        const rows = response.data.trim().split('\n');
        if (rows.length > 1) {
          const [, commonName] = rows[1].split(',');
          return commonName;
        }
      } catch (error) {
        console.error('Error fetching common name:', error);
        return null;
      }
    }


    fetchRandomChecklistWithBirds();
  }, []);

  const { date, time } = parseDateTime(dateTimeString);

  function generateRandomSubId() {
    return Math.floor(Math.random() * 9000000) + 10000000;
  }

  return (
    <div className={styles.game}>
      <div className={styles.gameItem}>
        {checklist && checklist.obs && (
          <div>
            <div className={styles.checkListTitle}>
              <h2>Bird Observations</h2>
            </div>

            <ul className={styles.birdList}>
              {checklist.obs.map((observation) => (
                <li key={observation.speciesCode} className={styles.birdListItem}>
                  {observation.commonName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.gameItem}>
        <h1>{dateTimeString}</h1>
        <h2 className={styles.date}>{date}</h2>
        <h3>{time}</h3>
      </div>
    </div>
  );
};

export default MainGame;
