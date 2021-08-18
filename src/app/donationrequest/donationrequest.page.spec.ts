import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DonationrequestPage } from './donationrequest.page';

describe('DonationrequestPage', () => {
  let component: DonationrequestPage;
  let fixture: ComponentFixture<DonationrequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DonationrequestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DonationrequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
