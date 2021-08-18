import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RatingpopoverPage } from './ratingpopover.page';

describe('RatingpopoverPage', () => {
  let component: RatingpopoverPage;
  let fixture: ComponentFixture<RatingpopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingpopoverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingpopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
