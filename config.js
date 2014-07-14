/*
 * Latch NodeJS SDK
 * Copyright (C) 2014 Eleven Paths

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

var config = {
    appId: '',
    secretKey: '',
    
    API_HOST: "https://latch.elevenpaths.com:443",
    API_CHECK_STATUS_URL:"/api/0.7/status",
    API_PAIR_URL:"/api/0.7/pair",
    API_PAIR_WITH_ID_URL:"/api/0.7/pairWithId",
    API_UNPAIR_URL:"/api/0.7/unpair",
    
    AUTHORIZATION_HEADER_NAME:"Authorization",
    DATE_HEADER_NAME:"X-11Paths-Date",
    AUTHORIZATION_METHOD: "11PATHS",
    AUTHORIZATION_HEADER_FIELD_SEPARATOR: " ",

    UTC_STRING_FORMAT: "%Y-%m-%d %H:%M:%S",
    
    X_11PATHS_HEADER_PREFIX: "X-11paths-",
    X_11PATHS_HEADER_SEPARATOR: ":",
};

module.exports = config;