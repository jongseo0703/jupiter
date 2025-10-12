-- 기존 데이터 삭제 (외래 키 제약 조건 순서 고려)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_activity;
TRUNCATE TABLE user_product_score;
TRUNCATE TABLE review;
TRUNCATE TABLE price;
TRUNCATE TABLE product_shop;
TRUNCATE TABLE product;
TRUNCATE TABLE shop;
TRUNCATE TABLE subcategory;
TRUNCATE TABLE topcategory;
SET FOREIGN_KEY_CHECKS = 1;

-- 상위 카테고리
INSERT INTO topcategory (topcategory_id, top_name) VALUES
(1, '위스키'),
(2, '와인'),
(3, '맥주'),
(4, '전통주');

-- 하위 카테고리
INSERT INTO subcategory (subcategory_id, sub_name, topcategory_id) VALUES
(1, '스카치 위스키', 1),
(2, '버번 위스키', 1),
(3, '레드 와인', 2),
(4, '화이트 와인', 2),
(5, '라거', 3),
(6, 'IPA', 3),
(7, '막걸리', 4),
(8, '청주', 4);

-- 상품
INSERT INTO product (product_id, product_name, description, brand, alcohol_percentage, volume, url, subcategory_id) VALUES
(1, '글렌피딕 12년', '싱글 몰트 스카치 위스키의 대표주자', '글렌피딕', 40.0, 700, 'https://example.com/glenfiddich12.jpg', 1),
(2, '조니워커 블랙 라벨', '스무스한 맛의 블렌디드 위스키', '조니워커', 40.0, 700, 'https://example.com/johnniewalker.jpg', 1),
(3, '잭 다니엘스', '테네시 위스키의 아이콘', '잭 다니엘스', 40.0, 700, 'https://example.com/jackdaniels.jpg', 2),
(4, '메이커스 마크', '달콤하고 부드러운 버번', '메이커스 마크', 45.0, 750, 'https://example.com/makersmark.jpg', 2),
(5, '샤또 마고', '프랑스 보르도 최고급 레드 와인', '샤또 마고', 13.5, 750, 'https://example.com/chateaumargaux.jpg', 3),
(6, '오퍼스 원', '나파밸리 프리미엄 레드 와인', '오퍼스 원', 14.5, 750, 'https://example.com/opusone.jpg', 3),
(7, '샤블리', '프랑스 부르고뉴 화이트 와인', '윌리엄 페브르', 12.5, 750, 'https://example.com/chablis.jpg', 4),
(8, '클라우디 베이', '뉴질랜드 소비뇽 블랑', '클라우디 베이', 13.0, 750, 'https://example.com/cloudybay.jpg', 4),
(9, '하이네켄', '세계적인 라거 맥주', '하이네켄', 5.0, 330, 'https://example.com/heineken.jpg', 5),
(10, '버드와이저', '미국 대표 라거', '버드와이저', 5.0, 355, 'https://example.com/budweiser.jpg', 5),
(11, '브루독 펑크 IPA', '스코틀랜드 크래프트 IPA', '브루독', 5.6, 330, 'https://example.com/brewdog.jpg', 6),
(12, '구스 아일랜드 IPA', '시카고 스타일 IPA', '구스 아일랜드', 5.9, 355, 'https://example.com/gooseisland.jpg', 6),
(13, '국순당 생막걸리', '전통 방식 생막걸리', '국순당', 6.0, 750, 'https://example.com/kooksoondang.jpg', 7),
(14, '백세주', '한국 대표 리큐르 막걸리', '국순당', 13.0, 375, 'https://example.com/baekseju.jpg', 7),
(15, '백화수복', '프리미엄 전통주', '국순당', 13.0, 375, 'https://example.com/baekhwasubok.jpg', 8);

-- 상점
INSERT INTO shop (shop_id, shop_name, logo_icon) VALUES
(1, 'GS25', 'https://example.com/gs25_logo.png'),
(2, 'CU', 'https://example.com/cu_logo.png'),
(3, '이마트24', 'https://example.com/emart24_logo.png'),
(4, '와인25플러스', 'https://example.com/wine25_logo.png'),
(5, '쿠팡', 'https://example.com/coupang_logo.png');

-- 상품_상점
INSERT INTO product_shop (product_shop_id, link, is_available, product_id, shop_id) VALUES
(1, 'https://gs25.gsretail.com/products/1', true, 1, 1),
(2, 'https://cu.bgfretail.com/products/1', true, 1, 2),
(3, 'https://emart24.co.kr/products/2', true, 2, 3),
(4, 'https://wine25plus.com/products/5', true, 5, 4),
(5, 'https://coupang.com/products/6', true, 6, 5),
(6, 'https://gs25.gsretail.com/products/9', true, 9, 1),
(7, 'https://cu.bgfretail.com/products/10', true, 10, 2),
(8, 'https://emart24.co.kr/products/13', true, 13, 3),
(9, 'https://coupang.com/products/3', true, 3, 5),
(10, 'https://wine25plus.com/products/7', true, 7, 4),
(11, 'https://gs25.gsretail.com/products/11', true, 11, 1),
(12, 'https://cu.bgfretail.com/products/12', true, 12, 2),
(13, 'https://coupang.com/products/4', true, 4, 5),
(14, 'https://wine25plus.com/products/8', true, 8, 4),
(15, 'https://emart24.co.kr/products/14', true, 14, 3);

-- 가격
INSERT INTO price (price_id, price, delivery_fee, product_shop_id) VALUES
(1, 45000, 0, 1),
(2, 44000, 2500, 2),
(3, 38000, 0, 3),
(4, 850000, 3000, 4),
(5, 980000, 0, 5),
(6, 2500, 0, 6),
(7, 2800, 0, 7),
(8, 3500, 0, 8),
(9, 52000, 0, 9),
(10, 42000, 3000, 10),
(11, 4500, 0, 11),
(12, 4800, 0, 12),
(13, 48000, 0, 13),
(14, 38000, 3000, 14),
(15, 8900, 0, 15);

-- 리뷰
INSERT INTO review (review_id, writer, rating, review_date, title, comment, product_shop_id) VALUES
(1, '위스키러버', 5, '2024-09-15', '부드럽고 달콤해요', '처음 마셔본 스카치 위스키인데 정말 맛있습니다. 꿀향이 나고 부드러워요.', 1),
(2, '술고래', 4, '2024-09-20', '가격 대비 좋음', '이 가격에 이 정도면 훌륭합니다. 편의점에서 사서 집에서 마시기 좋아요.', 2),
(3, '맥주마니아', 5, '2024-10-01', '역시 하이네켄', '시원하게 한 잔 하기 좋습니다. 맛이 깔끔해요.', 6),
(4, '전통주팬', 5, '2024-09-28', '생막걸리 최고', '국순당 생막걸리는 역시 맛이 다릅니다. 신선하고 좋아요.', 8),
(5, '와인애호가', 5, '2024-10-02', '가격은 비싸지만 최고급', '특별한 날을 위해 구매했는데 정말 만족스럽습니다.', 4),
(6, '버번팬', 4, '2024-09-25', '부드럽고 달콤', '버번 입문자에게 추천합니다. 마시기 편해요.', 13),
(7, '크래프트맥주', 5, '2024-10-03', 'IPA 좋아하시면 강추', '홉의 향이 풍부하고 쓴맛이 적당합니다.', 11),
(8, '화이트와인러버', 4, '2024-09-30', '상큼한 맛', '생선요리와 함께 먹었는데 궁합이 좋습니다.', 10);

-- 사용자 행동 데이터 (3명의 사용자)
-- 사용자 1: 위스키를 좋아하는 사용자
INSERT INTO user_activity (user_id, product_id, activity_type, created_at) VALUES
(1, 1, 'CLICK', '2024-10-01 10:31:00'),
(1, 1, 'FAVORITE', '2024-10-01 10:32:00'),
(1, 2, 'CLICK', '2024-10-01 11:01:00'),
(1, 3, 'CLICK', '2024-10-02 09:05:00'),
(1, 4, 'CLICK', '2024-10-03 14:00:00');

-- 사용자 2: 와인을 좋아하는 사용자
INSERT INTO user_activity (user_id, product_id, activity_type, created_at) VALUES
(2, 5, 'CLICK', '2024-10-01 12:05:00'),
(2, 5, 'FAVORITE', '2024-10-01 12:10:00'),
(2, 6, 'CLICK', '2024-10-01 13:05:00'),
(2, 6, 'FAVORITE', '2024-10-01 13:10:00'),
(2, 7, 'CLICK', '2024-10-02 10:05:00'),
(2, 8, 'CLICK', '2024-10-03 11:00:00');

-- 사용자 3: 맥주와 전통주를 좋아하는 사용자
INSERT INTO user_activity (user_id, product_id, activity_type, created_at) VALUES
(3, 9, 'CLICK', '2024-10-01 18:05:00'),
(3, 9, 'FAVORITE', '2024-10-01 18:10:00'),
(3, 10, 'CLICK', '2024-10-01 19:05:00'),
(3, 11, 'CLICK', '2024-10-02 17:05:00'),
(3, 11, 'FAVORITE', '2024-10-02 17:10:00'),
(3, 13, 'CLICK', '2024-10-03 12:05:00'),
(3, 13, 'FAVORITE', '2024-10-03 12:10:00'),
(3, 14, 'CLICK', '2024-10-03 13:05:00');
