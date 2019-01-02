
# Script to clean and filter IBTrACS csv data set
# Available at : https://www.ncdc.noaa.gov/ibtracs/

import pandas as pd
import numpy as np


IBTRACS_FILE = 'Allstorms.ibtracs_all.v03r10.csv'
OUTPUT_FILE = 'storms.csv'

# Ignore first 3 header rows ad use longitude_for_mapping and latitude_for_mapping attributes as lon & lan
df = pd.read_csv(IBTRACS_FILE, header=None, skiprows=[0, 1, 2],
                 usecols=[0, 1, 3, 5, 6, 7, 10, 11, 16, 17],
                 names=['id', 'year', 'basin', 'name', 'time', 'type', 'wind', 'pres', 'lat', 'lon'])

# Rename all unnamed storms as 'UNNAMED'
df.loc[df['name'] == 'NOT NAMED', 'name'] = 'UNNAMED'
df.loc[df['name'] == 'SUBTROP:UNNAMED', 'name'] = 'UNNAMED'

# Set missing values as NaN
df.loc[df['wind'] <= 0, 'wind'] = np.nan

df.loc[df['pres'] <= 0, 'pres'] = np.nan
df.loc[df['pres'] == 9999., 'pres'] = np.nan

# print(df.id.groupby(df.name).nunique().sort_values(ascending=False).reset_index(name='count'))
# print(df.head())
# print(df.dtypes)

df.to_csv(OUTPUT_FILE)
